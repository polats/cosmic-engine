const { z } = require('zod');
 
const Config = z.object({
    NEYNAR_API_KEY: z.string(),
    SIGNER_UUID: z.string(),
    TTS_HOOK_ENDPOINT: z.string(),
});
 
const config = Config.parse(process.env);
 
module.exports.config = config;