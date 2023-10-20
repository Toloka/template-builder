import React from 'react';

import { BlockErrors } from './BlockErrors';

type Props = {
    children: React.ReactNode;
    seed: unknown;
    errorView?: React.ComponentType<{ error: Error }>;
    onError?: (error: Error) => void;
};

type State = { error: Error | null; oldSeed: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null, oldSeed: props.seed };
    }

    componentDidCatch(error: Error) {
        if (!this.state.error) {
            this.setState({ error });
        }
    }

    static getDerivedStateFromProps(props: Props, state: State): State | null {
        if (props.seed !== state.oldSeed) {
            return { error: null, oldSeed: props.seed };
        }

        return null;
    }

    render() {
        if (this.state.error !== null) {
            if (this.props.onError) {
                this.props.onError(this.state.error);
            }
            if (this.props.errorView) {
                const View = this.props.errorView;

                return <View error={this.state.error} />;
            }

            return <BlockErrors errors={[this.state.error as any]} />;
        }

        return this.props.children;
    }
}
