export type Item = {
    name: string;
    base64image: string;
    amount: string;
}

export const JJ_CONTRACT_NAME = "JackpotJunction";
export const ROLL_COST = "100";
export const CRAFT_COST = 1;

export const TIER_COLORS = [
    "#7F7F7F", // Common - Grey
    "#D9D9D9", // Uncommon - White
    "#66CC66", // Rare - Green
    "#3366CC", // Epic - Blue
    "#9933CC", // Legendary - Purple
    "#CC6600", // Artifact - Orange
    "#CCB266"  // Heirloom - Gold
];

export const TIER_TEXT_COLORS = [
    "#4F4F4F", // Darker Grey
    "#999999", // Darker White
    "#339933", // Darker Green
    "#0044CC", // Darker Blue
    "#6600CC", // Darker Purple
    "#CC2200", // Darker Orange
    "#CC8800"  // Darker Gold
];

export const ITEM_ID_IMAGE_LAYER_NAMES = [
    // 0
    ["plains_cover", "Shady Adventurer (Plains Cover)"],
    ["plains_body", "Scythe Body (Plains Body)"],
    ["plains_fwheel", "Grass Cutters (Plains Wheel)"],
    ["plains_beast", "Two-Headed Ox (Plains Beast)"],

    // 1
    ["forest_cover", "Mossy Camouflage (Forest Cover)"],
    ["forest_body", "Chainsaw Body (Forest Body)"],
    ["forest_fwheel", "ATV Tires (Forest Wheel)"],
    ["forest_beast", "Giant Sloth (Forest Beast)"],

    // 2
    ["swamp_cover", "Mosquito Netting (Swamp Cover)"],
    ["swamp_body", "Fisherman Body (Swamp Body)"],
    ["swamp_fwheel", "Mud Flaps (Swamp Wheel)"],
    ["swamp_beast", "Alligator (Swamp Beast)"],

    // 3
    ["water_cover", "Waterproof Tarp (Water Cover)"],
    ["water_body", "Inflatable Body (Water Body)"],
    ["water_fwheel", "Displacement Discs (Water Wheel)"],
    ["water_beast", "Giant Capybara (Water Beast)"],

    // 4
    ["mountain_cover", "Rockslide Shield (Mountain Cover)"],
    ["mountain_body", "Dent-proof Body (Mountain Body)"],
    ["mountain_fwheel", "Ratcheting Rollers (Mountain Wheel)"],
    ["mountain_beast", "Mountain Goat (Mountain Beast)"],

    // 5
    ["desert_cover", "Sun Canopy (Desert Cover)"],
    ["desert_body", "Ventilated Body (Desert Body)"],
    ["desert_fwheel", "Tank Treads (Desert Wheel)"],
    ["desert_beast", "Camel-sized Camel Spider (Desert Beast)"],

    // 6
    ["ice_cover", "Fur-Lined Cover (Ice Cover)"],
    ["ice_body", "Insulated Body (Ice Body)"],
    ["ice_fwheel", "Spiked Wheels (Ice Wheel)"],
    ["ice_beast", "Giant Walrus (Ice Beast)"],
]