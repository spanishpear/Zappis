import { PathGenerator } from '../PathGenerator';
import type {
    GridPosition,
    ComponentAnchor,
    ComponentBoundary,
    WirePathOptions,
    PathSegment
} from '../types';

describe('PathGenerator', () => {
    let pathGenerator: PathGenerator;
    const defaultOptions: WirePathOptions = {
        grid: {
            spacing: 20,
            offset: 0,
            snapThreshold: 5
        },
        rules: {
            maxBends: 3,
            minSegmentLength: 20,
            bendRadius: 10,
            bundleSpacing: 5
        }
    };

    beforeEach(() => {
        pathGenerator = new PathGenerator(defaultOptions);
    });

    describe('Grid Alignment', () => {
        it('should snap points to grid', () => {
            const point: GridPosition = { x: 28, y: 33 };
            const snapped = pathGenerator.snapToGrid(point);
            
            expect(snapped.x).toBe(20); // Rounds to nearest 20
            expect(snapped.y).toBe(40); // Rounds to nearest 20
        });

        it('should respect grid offset', () => {
            const pathGenerator = new PathGenerator({
                ...defaultOptions,
                grid: { ...defaultOptions.grid, offset: 10 }
            });

            const point: GridPosition = { x: 28, y: 33 };
            const snapped = pathGenerator.snapToGrid(point);
            
            expect(snapped.x).toBe(30); // Rounds to nearest 20 + 10 offset
            expect(snapped.y).toBe(30); // Rounds to nearest 20 + 10 offset
        });

        it('should detect grid-aligned points', () => {
            const aligned: GridPosition = { x: 40, y: 40 };
            const unaligned: GridPosition = { x: 45, y: 47 }; // More than spacing/4 away from grid
            
            expect(pathGenerator.isAlignedToGrid(aligned)).toBe(true);
            expect(pathGenerator.isAlignedToGrid(unaligned)).toBe(false);
        });

        it('should consider snap threshold for alignment', () => {
            const nearlyAligned: GridPosition = { x: 41, y: 42 }; // Within spacing/4
            expect(pathGenerator.isAlignedToGrid(nearlyAligned)).toBe(true);
        });
    });

    describe('Path Generation', () => {
        const mockStartAnchor: ComponentAnchor = {
            position: { x: 20, y: 20 }, // Aligned to grid
            direction: 'east',
            type: 'output',
            offset: 0
        };

        const mockEndAnchor: ComponentAnchor = {
            position: { x: 100, y: 100 }, // Aligned to grid
            direction: 'west',
            type: 'input',
            offset: 0
        };

        const mockStartBoundary: ComponentBoundary = {
            topLeft: { x: 0, y: 0 },
            bottomRight: { x: 40, y: 40 },
            anchors: []
        };

        const mockEndBoundary: ComponentBoundary = {
            topLeft: { x: 80, y: 80 },
            bottomRight: { x: 120, y: 120 },
            anchors: []
        };

        it('should generate paths perpendicular to component boundaries', () => {
            const route = pathGenerator.generatePath(
                mockStartAnchor,
                mockEndAnchor,
                mockStartBoundary,
                mockEndBoundary
            );

            const firstSegment = route.segments[0];
            const lastSegment = route.segments[route.segments.length - 1];

            expect(firstSegment).toBeDefined();
            expect(lastSegment).toBeDefined();
            if (!firstSegment || !lastSegment) return;

            expect(pathGenerator.isPerpendicularToComponent(firstSegment, mockStartBoundary)).toBe(true);
            expect(pathGenerator.isPerpendicularToComponent(lastSegment, mockEndBoundary)).toBe(true);
        });

        it('should respect maximum bend count', () => {
            const route = pathGenerator.generatePath(
                mockStartAnchor,
                mockEndAnchor,
                mockStartBoundary,
                mockEndBoundary
            );

            const bendCount = pathGenerator.countBends(route.segments);
            expect(bendCount).toBeLessThanOrEqual(defaultOptions.rules.maxBends);
        });

        it('should maintain minimum segment length', () => {
            const route = pathGenerator.generatePath(
                mockStartAnchor,
                mockEndAnchor,
                mockStartBoundary,
                mockEndBoundary
            );

            route.segments.forEach(segment => {
                const length = calculateSegmentLength(segment);
                expect(length).toBeGreaterThanOrEqual(defaultOptions.rules.minSegmentLength);
            });
        });

        it('should generate grid-aligned paths', () => {
            const route = pathGenerator.generatePath(
                mockStartAnchor,
                mockEndAnchor,
                mockStartBoundary,
                mockEndBoundary
            );

            route.segments.forEach(segment => {
                expect(pathGenerator.isAlignedToGrid(segment.start)).toBe(true);
                expect(pathGenerator.isAlignedToGrid(segment.end)).toBe(true);
            });
        });
    });
});

// Helper function to calculate segment length
function calculateSegmentLength(segment: PathSegment): number {
    const dx = segment.end.x - segment.start.x;
    const dy = segment.end.y - segment.start.y;
    return Math.sqrt(dx * dx + dy * dy);
} 