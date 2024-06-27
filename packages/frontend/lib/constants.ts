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
    ["plains_cover", "Shady Adventurer"],
    ["plains_body", "Scythe Body"],
    ["plains_fwheel", "Grass Cutters"],
    ["plains_beast", "Two-Headed Ox"],

    // 1
    ["forest_cover", "Mossy Camouflage"],
    ["forest_body", "Chainsaw Body"],
    ["forest_fwheel", "ATV Tires"],
    ["forest_beast", "Giant Sloth"],

    // 2
    ["swamp_cover", "Mosquito Netting"],
    ["swamp_body", "Fisherman Body"],
    ["swamp_fwheel", "Mud Flaps"],
    ["swamp_beast", "Alligator"],

    // 3
    ["water_cover", "Waterproof Tarp"],
    ["water_body", "Inflatable Body"],
    ["water_fwheel", "Displacement Discs"],
    ["water_beast", "Giant Capybara"],

    // 4
    ["mountain_cover", "Rockslide Shield"],
    ["mountain_body", "Dent-proof Body"],
    ["mountain_fwheel", "Ratcheting Rollers"],
    ["mountain_beast", "Mountain Goat"],

    // 5
    ["desert_cover", "Sun Canopy"],
    ["desert_body", "Ventilated Body"],
    ["desert_fwheel", "Tank Treads"],
    ["desert_beast", "Camel-sized Camel Spider"],

    // 6
    ["ice_cover", "Fur-Lined Cover"],
    ["ice_body", "Insulated Body"],
    ["ice_fwheel", "Spiked Wheels"],
    ["ice_beast", "Giant Walrus"],
]