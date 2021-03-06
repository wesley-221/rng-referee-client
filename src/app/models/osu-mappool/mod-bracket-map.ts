import { Gamemodes } from "../osu-models/osu-api";

export class ModBracketMap {
    invalid: boolean = false;
    beatmapId: number = null;
    beatmapName: string = null;
    beatmapUrl: string = null;
    modifier: number = null;
    gamemodeId: Gamemodes = Gamemodes.Osu;

    /**
     * Make a true copy of the given bracketmap
     * @param bracketMap the bracketmap
     */
    public static makeTrueCopy(bracketMap: ModBracketMap): ModBracketMap {
        const newModBracketMap = new ModBracketMap();

        newModBracketMap.invalid = bracketMap.invalid;
        newModBracketMap.beatmapId = bracketMap.beatmapId;
        newModBracketMap.beatmapName = bracketMap.beatmapName;
        newModBracketMap.beatmapUrl = bracketMap.beatmapUrl;
        newModBracketMap.modifier = bracketMap.modifier;
        newModBracketMap.gamemodeId = bracketMap.gamemodeId;

        return newModBracketMap;
    }
}
