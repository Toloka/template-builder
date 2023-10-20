import { KeyNode, ValueNode } from '@toloka-tb/lang.json';

import { getComponentPath } from '../../ast/astUtils';
import { deriveExpectations } from '../../expectations/expectations';
import { workerI18n } from '../workerI18n';
import { $emptyMatcher } from './matchers/emptyMatcher';
import { $refMatcher } from './matchers/refMatcher';
import { schemaMatcher } from './matchers/schemaMatcher';
import { typeMatcher } from './matchers/typeMatcher';
import { Marker, Match, Matcher, MatchObject } from './validationTypes';

const matchers: Matcher[] = [schemaMatcher, typeMatcher, $refMatcher, $emptyMatcher];

type ReactionResult = {
    marker: Marker | undefined;
    skip: MatchObject['skip'];
};
type TraverseResult = {
    markers: Marker[];
    skip: MatchObject['skip'];
};
type TraverseReaction = (value: ValueNode | KeyNode) => ReactionResult;

const justContinueTraversing: ReactionResult = {
    marker: undefined,
    skip: undefined
};

const justSkipSubtree: ReactionResult = {
    marker: undefined,
    skip: 'subtree'
};

const addMarker = (arr: Marker[], newMarker: Marker | undefined) => {
    if (newMarker) {
        arr.push(newMarker);
    }
};

const addMarkers = (arr: Marker[], newMarkers: Marker[] | undefined) => {
    if (newMarkers) {
        arr.push(...newMarkers);
    }
};

const traverse = (value: ValueNode, reaction: TraverseReaction) => {
    const stepResult: TraverseResult = {
        markers: [],
        skip: undefined
    };

    const result = reaction(value);

    addMarker(stepResult.markers, result.marker);

    if (result.skip) {
        stepResult.skip = result.skip;

        return stepResult;
    }

    if (value.type === 'object') {
        for (const prop of value.props) {
            const keyResult: ReactionResult = prop.key.type !== 'missing' ? reaction(prop.key) : justSkipSubtree;
            let valueResult: TraverseResult | undefined;

            // skip subtree -> we know that key value would be considered invalid and don't want to get useless errors from there
            if (keyResult.skip !== 'subtree' && prop.value.type !== 'missing') {
                valueResult = traverse(prop.value, reaction);
            }

            // when type is invalid, we know that everything else would be considered invalid as no schema would be found. We don't want to get useless errors from there
            if (keyResult.skip === 'this object') {
                stepResult.markers.length = 0; // clear all we know about this object
                addMarker(stepResult.markers, keyResult.marker);
                break;
            }

            if (valueResult?.skip === 'this object') {
                stepResult.markers.length = 0; // clear all we know about this object
                addMarkers(stepResult.markers, valueResult?.markers);
                break;
            }

            addMarker(stepResult.markers, keyResult.marker);
            addMarkers(stepResult.markers, valueResult?.markers);
        }
    }

    if (value.type === 'array') {
        for (const item of value.items) {
            if (item.type !== 'missing') {
                addMarkers(stepResult.markers, traverse(item, reaction).markers);
            }
        }
    }

    return stepResult;
};

export const validate = (ast: ValueNode): Marker[] => {
    const check: TraverseReaction = (node) => {
        const componentPath = getComponentPath(ast, node.from);
        const expectations = deriveExpectations(componentPath, { expectFilledCollections: false });

        if (expectations.manager.isExpected(['any'])) {
            return justSkipSubtree;
        }

        let hasMatched = false;
        let topMatch: Match | undefined;

        for (const matcher of matchers) {
            const match = matcher(expectations.manager, expectations.options);

            if (match) {
                if (match.valid) {
                    hasMatched = true;

                    if (match.message) {
                        topMatch = match;
                    } else {
                        topMatch = undefined;
                    }
                    break;
                }

                if (
                    match.message &&
                    (!topMatch || !topMatch.message || match.message.priority > topMatch.message.priority)
                ) {
                    topMatch = match;
                }
            }
        }

        if (!hasMatched || topMatch) {
            const range = topMatch ? topMatch.message?.range : undefined;

            const from = range?.form || node.from;
            const to = range?.to || node.to;
            const managerExpectations = expectations.manager.toString();
            const expectationMessage = managerExpectations
                ? workerI18n.t('validation.expected', { expectations: managerExpectations })
                : workerI18n.t('expectations.nothing');
            const message = topMatch && topMatch.message ? topMatch.message.text : expectationMessage;

            const result: ReactionResult = {
                marker: { from, to, message },
                skip: topMatch ? topMatch.skip : undefined
            };

            return result;
        }

        return justContinueTraversing;
    };

    const traverseResult = traverse(ast, check);

    return traverseResult.markers;
};

// export { } from "..." doesn't work for web worker
import { setEditors as _setEditors, setFrontendIdm as _setFrontendIdm } from '../../typeHandlers/typeHandlers';
import { setupWorkerI18n as _setupWorkerI18n } from '../workerI18n';
export const setEditors = _setEditors;
export const setFrontendIdm = _setFrontendIdm;
export const setupWorkerI18n = _setupWorkerI18n;
