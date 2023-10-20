import { makeForm } from './form';

describe('makeForm', () => {
    it('should create form', () => {
        makeForm();
    });
    it('should create form with basic properties', () => {
        const form = makeForm();

        expect(form).toHaveProperty('value');
        expect(form).toHaveProperty('touched');
    });
});
