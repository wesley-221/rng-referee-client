import { TeamPlayer } from "./team-player";

export class Team {
    teamName: string;
    private teamPlayers: TeamPlayer[];

    constructor() {
        this.teamPlayers = [];
    }

    /**
     * Get all the players
     */
    public getPlayers(): TeamPlayer[] {
        return this.teamPlayers;
    }

    /**
     * Add a player to the team
     * @param teamPlayer 
     */
    public addPlayer(teamPlayer: TeamPlayer): void {
        this.teamPlayers.push(teamPlayer);
    }

    /**
     * Remove a player from the team
     * @param teamPlayer 
     */
    public removePlayer(teamPlayer: TeamPlayer): void {
        this.teamPlayers.splice(this.teamPlayers.indexOf(teamPlayer), 1);
    }

    /**
     * Get all the players in an array
     */
    public getPlayersAsArray(): string[] {
        let returnArray: string[] = [];

        for(let player of this.teamPlayers) {
            returnArray.push(player.username);
        }

        return returnArray;
    }

    static makeTrueCopy(team: Team): Team {
        const newTeam = new Team();

        newTeam.teamName = team.teamName;

        for(let player in team.teamPlayers) {
            newTeam.addPlayer(TeamPlayer.makeTrueCopy(team.teamPlayers[player]));
        }
        
        return newTeam;
    }
}
