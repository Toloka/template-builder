import { CoreComponentApi } from './api/coreComponentApi';
import { CompileConfig, Compiler, TbConfig } from './compileConfig/compileConfig';
import { TbCtx } from './ctx/tbCtx';
import { TbProps } from './Tb/Tb';

export type CoreApi = {
    isTbCore: true;

    compileConfig: CompileConfig;
    register: (compiler: Compiler<any, any>) => void;

    /**
     * @deprecated use makeCtxV2 if available
     */
    makeCtx: (config: TbConfig, input: TbCtx['input'], output?: TbCtx['input']['value']) => TbCtx;
    makeCtxV2: (
        config: TbConfig,
        input: TbCtx['input'],
        intl: TbCtx['intl'],
        output?: TbCtx['input']['value']
    ) => TbCtx;
    Tb: React.ForwardRefExoticComponent<TbProps & React.RefAttributes<HTMLFormElement>>;

    translations: { [lang: string]: { [key: string]: string } };
} & CoreComponentApi;
