export class TeamPlayer {
    username: string;

    constructor() { }

    static makeTrueCopy(teamPlayer: TeamPlayer): TeamPlayer {
        const newTeamPlayer = new TeamPlayer();

        newTeamPlayer.username = teamPlayer.username;

        return newTeamPlayer;
    }
}
