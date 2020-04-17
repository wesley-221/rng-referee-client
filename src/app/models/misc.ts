import { MultiplayerLobbiesService } from "../services/multiplayer-lobbies.service";
import { MultiplayerLobby } from "./store-multiplayer/multiplayer-lobby";
import { ModBracket } from "./osu-mappool/mod-bracket";
import { ModBracketMap } from "./osu-mappool/mod-bracket-map";

export class Misc {
    /**
	 * Pick a map from a given bracket
	 * @param multiplayerLobbyService
	 * @param lobby
	 * @param bracket the bracket to pick from
	 * @param ircChannelName
	 */
	staticPickRandomMap(multiplayerLobbyService: MultiplayerLobbiesService, lobby: MultiplayerLobby, bracket: ModBracket, ircChannelName: string) {
		let randomMap: ModBracketMap = null;

		do {
			const map = bracket.beatmaps[Math.floor(Math.random() * bracket.beatmaps.length)];

			if(!this.staticBeatmapIsBanned(lobby, map.beatmapId) && !this.staticBeatmapIsPicked(lobby, map.beatmapId)) {
				randomMap = map;
			}
		}
		while(randomMap == null);

		if(randomMap != null) {
			if(!lobby.picks.hasOwnProperty(bracket.bracketName))
				lobby.picks[bracket.bracketName] = [];

			lobby.picks[bracket.bracketName].push(randomMap.beatmapId);
			multiplayerLobbyService.update(lobby);

			return randomMap;
		}
		else {
			return null;
		}
    }

    /**
	 * Check if a beatmap is banned for either of the teams
	 * @param multiplayerLobby
	 * @param beatmapId the beatmap to check
	 */
	staticBeatmapIsBanned(multiplayerLobby: MultiplayerLobby, beatmapId: number) {
		return multiplayerLobby.teamOneBans.indexOf(beatmapId) > -1 || multiplayerLobby.teamTwoBans.indexOf(beatmapId) > -1;
	}

	/**
	 * Check if a beatmap has been picked
	 * @param mutliplayerLobby
	 * @param beatmapId the beatmap to check
	 */
	staticBeatmapIsPicked(mutliplayerLobby: MultiplayerLobby, beatmapId: number) {
		let beatmapFound: boolean = false;

		if(Object.keys(mutliplayerLobby.picks).length > 0) {
			for(let bracket in mutliplayerLobby.picks) {
				if(!mutliplayerLobby.picks.hasOwnProperty(bracket))
					break;

				if(mutliplayerLobby.picks[bracket].indexOf(beatmapId) > -1) {
					beatmapFound = true;
					break;
				}
			}
		}

		return beatmapFound;
	}
}
