export const LAYERS = {
    BOARD: 0,
    TOP_COPPER: 1,
    BOTTOM_COPPER: 2,
    SILKSCREEN_TOP: 3,
    SILKSCREEN_BOTTOM: 4,
    HOLES: 5,
};

export const Z_OFFSETS = {
    BOARD: 0,
    TOP_COPPER: 0.05,
    TOP_PAD: 0.052,
    BOTTOM_COPPER: -0.05,
    BOTTOM_PAD: -0.052,
    SILKSCREEN_TOP: 0.07,
    SILKSCREEN_BOTTOM: -0.07,
};

export const COLORS = {
    BOARD: 0x1a4a1a,
    COPPER: 0xb87333,
    SILKSCREEN: 0xeeeeee,
    HOLE: 0x050505,
};
