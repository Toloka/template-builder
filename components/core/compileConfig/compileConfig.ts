import { mapObject } from '@toloka-tb/common/utils/mapObject';

import { getByPath } from '../access/getByPath';
import { FieldConfig } from '../api/helpers/field';
import { Plugin } from '../api/helpers/plugin';
import { ViewConfig } from '../api/helpers/view';
import { CoreApi } from '../coreApi';

export type ComponentConfig = ViewConfig | FieldConfig;

type CompilableItem = TypedObject | { $ref: string } | { $empty: true };
export type Compilable = CompilableItem | CompilableItem[];

export type CompilationHook<Component = unknown> = (source: Compilable, result: Component, path: string) => void;
export type CompilationOptions = { hooks?: CompilationHook[]; core?: CoreApi };

export type TypedObject = { type: string; [key: string]: any };

export type JSONConfig = {
    view: Compilable;
    plugins?: TypedObject[];
    vars?: object;
};

export type TbConfig = {
    view: ComponentConfig;
    plugins: Plugin[];
    core?: CoreApi;
};

export type CompileConfig = (config: JSONConfig, options?: CompilationOptions) => TbConfig;

export type Compiler<T, R> = {
    type: string;
    options?: {
        shallow?: boolean;
        shallowKeys?: Array<keyof T>;
    };
    merge?: (items: T[]) => T[];
    compile: (props: T) => R;
};

const type2compiler: { [type: string]: Compiler<any, any> } = {};

export const getRegisteredTypes = () => Object.keys(type2compiler);

export type Register = <T, R = any>(compiler: Compiler<T, R>) => void;

export const register: Register = (compiler) => {
    if (type2compiler[compiler.type]) {
        throw new Error(`Attempt to register on top of existing compiler ${compiler.type}`);
    }
    type2compiler[compiler.type] = compiler;
};

const compiled = new Map<any, any>();

export const compile = (
    { source, fullSource, options }: { source: Compilable; fullSource: JSONConfig; options?: CompilationOptions },
    path: string,
    referenceFollowStack: string[] = []
): any => {
    if (compiled.has(source)) {
        return compiled.get(source);
    }

    if (typeof source !== 'object' || !source) {
        return source;
    }

    if (Array.isArray(source)) {
        const compiledArr = source.map((x, key) =>
            compile(
                { source: x, fullSource, options },
                path !== '' ? `${path}.${key}` : key.toString(),
                referenceFollowStack
            )
        );

        compiled.set(source, compiledArr);

        return compiledArr;
    }

    if ('$ref' in source && !('type' in source)) {
        const target = getByPath(fullSource, source.$ref) as any;

        if (typeof target === 'undefined') {
            throw new Error(`Attempt to compile nonexistent ref ${source.$ref} in object: "${path}"`);
        }

        if (referenceFollowStack.includes(source.$ref)) {
            throw new Error(
                `Attempt to use recursive ref (${source.$ref}) in ref follow stack [${referenceFollowStack.join(
                    ' > '
                )}] (caught in "${path}")`
            );
        }

        return compile({ source: target, fullSource, options }, source.$ref, [...referenceFollowStack, source.$ref]);
    }
    if ('$empty' in source && !('type' in source)) {
        return undefined;
    }

    const { type, ...rest } = source;

    if (!type) {
        return mapObject(source, (value, key) =>
            compile(
                { source: value, fullSource, options },
                path !== '' ? `${path}.${key}` : key.toString(),
                referenceFollowStack
            )
        );
    }

    const compiler = type2compiler[type];

    if (!compiler) {
        throw new Error(`No compiler for type ${type} for object: "${path}"`);
    }

    const shallowKeys = getByPath(compiler, 'options.shallowKeys') as any[] | undefined;

    const compiledRest = getByPath(compiler, 'options.shallow')
        ? rest
        : mapObject(rest, (x, key) => {
              if (shallowKeys && shallowKeys.includes(key)) {
                  return x;
              }

              return compile(
                  { source: x, fullSource, options },
                  path !== '' ? `${path}.${key}` : key.toString(),
                  referenceFollowStack
              );
          });
    const compiledSource = compiler.compile({ ...compiledRest, type });

    if (options && options.hooks) {
        options.hooks.forEach((hook) => hook(source, compiledSource, path));
    }

    compiledSource.__configPath = path;
    compiled.set(source, compiledSource);

    return compiledSource;
};

const mergePlugins = (plugins: TypedObject[]) => {
    const last: {
        [type: string]: TypedObject[];
    } = {};

    for (const plugin of plugins) {
        if (!last[plugin.type]) {
            last[plugin.type] = [plugin];
        } else {
            const merge = getByPath(type2compiler, `${plugin.type}.merge`);

            if (merge) {
                last[plugin.type] = merge(last[plugin.type].concat(plugin));
            } else {
                last[plugin.type].push(plugin);
            }
        }
    }

    return Object.values(last).reduce((acc, value) => acc.concat(value), []);
};

export const compileConfig = (fullSource: JSONConfig, options?: CompilationOptions): TbConfig => {
    compiled.clear();

    const view = compile({ source: fullSource.view, fullSource, options }, 'view');
    const plugins = mergePlugins(fullSource.plugins || []).map((source, index) =>
        compile({ source, fullSource, options }, `plugins.${index}`)
    );

    return {
        view,
        plugins,
        core: options?.core
    };
};
