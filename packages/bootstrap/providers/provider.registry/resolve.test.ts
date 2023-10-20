import fetchMock from 'jest-fetch-mock';

import { makeDefaultOptions } from './options';
import { getComponentsMeta } from './resolve';

// setup
expect.extend({
    toContainObject(received, argument) {
        const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));

        if (pass) {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(
                        argument
                    )}`,
                pass: true
            };
        } else {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(
                        argument
                    )}`,
                pass: false
            };
        }
    }
});
fetchMock.enableMocks();
declare global {
    // eslint-disable-next-line no-redeclare
    namespace jest {
        interface Matchers<R> {
            toContainObject(object: object): R;
        }
    }
}

// mocks
const mock = {
    core: {
        type: 'core',
        version: '1.2.1',
        dependencies: {}
    },
    'view.text': {
        type: 'view.text',
        version: '1.0.1',
        dependencies: {
            core: '1.0.0'
        }
    },
    'field.text': {
        type: 'field.text',
        version: '1.1.0',
        dependencies: {
            core: '1.0.0'
        }
    }
} as const;
const promiseTimer = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

type MockMap = typeof mock;
type Mock = MockMap[keyof MockMap];

const mockResponse = (components: Mock[], time = 0) => {
    fetchMock.mockOnce(async () => {
        await promiseTimer(time);

        return JSON.stringify({ found: components });
    });
};

describe('bootstrap > registryProvider > resolve', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('fetches dependency data', async () => {
        mockResponse([mock.core]);
        const data = await getComponentsMeta({ core: '1.0.0' }, makeDefaultOptions());

        expect(data.length).toBe(1);
        expect(data[0].type).toBe(mock.core.type);
        expect(data[0].version).toBe(mock.core.version);
    });

    it('fetches dependency data including transitive dependencies', async () => {
        mockResponse([mock.core, mock['view.text']]);
        const data = await getComponentsMeta({ 'view.text': '1.0.0', core: '1.0.0' }, makeDefaultOptions());

        expect(data.length).toBe(2);
        expect(data).toContainObject(mock['view.text']);
        expect(data).toContainObject(mock['core']);
    });

    it('only requests items once', async () => {
        const options = makeDefaultOptions();

        mockResponse([mock.core, mock['view.text']]);
        await getComponentsMeta({ 'view.text': '1.0.0', core: '1.0.0' }, options);

        // we didn't respond with view.text so it has to be from cache
        mockResponse([mock.core, mock['field.text']]);
        const data = await getComponentsMeta({ 'view.text': '1.0.0', 'field.text': '1.0.0', core: '1.0.0' }, options);

        expect(data.length).toBe(3);
        expect(data).toContainObject(mock['view.text']);
        expect(data).toContainObject(mock['field.text']);
        expect(data).toContainObject(mock['core']);
    });

    it('can reuse concurrent resolves', async () => {
        const options = makeDefaultOptions();

        mockResponse([mock.core, mock['view.text']], 100);
        getComponentsMeta({ 'view.text': '1.0.0', core: '1.0.0' }, options);

        mockResponse([mock.core, mock['field.text']], 10);
        const data = await getComponentsMeta({ 'view.text': '1.0.0', 'field.text': '1.0.0', core: '1.0.0' }, options);

        expect(data.length).toBe(3);
        expect(data).toContainObject(mock['view.text']);
        expect(data).toContainObject(mock['field.text']);
        expect(data).toContainObject(mock['core']);
    });

    it('can reuse concurrent resolves for transitive dependencies if locks are same', async () => {
        const options = makeDefaultOptions();

        mockResponse([mock.core, mock['view.text'], mock['field.text']], 100);
        getComponentsMeta({ 'view.text': '1.0.0', 'field.text': '1.0.0', core: '1.0.0' }, options);

        mockResponse([], 10);
        const data = await getComponentsMeta({ 'view.text': '1.0.0', 'field.text': '1.0.0' }, options);

        expect(data.length).toBe(3);
        expect(data).toContainObject(mock['view.text']);
        expect(data).toContainObject(mock['field.text']);
        expect(data).toContainObject(mock['core']);
    });

    it('can reuse concurrent resolves for transitive dependencies if dependencies are same', async () => {
        const options = makeDefaultOptions();

        mockResponse([mock['view.text'], mock.core], 100);
        getComponentsMeta({ 'view.text': '1.0.0', core: '1.0.0' }, options);

        mockResponse([mock['field.text'], mock.core], 10);
        const data = await getComponentsMeta({ 'view.text': '1.0.0', 'field.text': '1.0.0', core: '1.0.0' }, options);

        expect(data.length).toBe(3);
        expect(data).toContainObject(mock['view.text']);
        expect(data).toContainObject(mock['field.text']);
        expect(data).toContainObject(mock['core']);
    });
});
