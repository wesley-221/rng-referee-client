import { Team } from "./teams/team";

export class Tournament {
	tournamentId: number;
	tournamentName: string;
	acronym: string;
	teams: Team[];

	constructor() {
        this.teams = [];
	}

	getTeams(): Team[] {
		return this.teams;
	}

	addTeam(team: Team) {
		this.teams.push(team);
	}

	removeTeam(team: Team) {
		this.teams.splice(this.teams.indexOf(team), 1);
	}

	static makeTrueCopy(tournament: Tournament) {
		const newTournament = new Tournament();

		newTournament.tournamentName = tournament.tournamentName;
		newTournament.acronym = tournament.acronym;

		for(let team in tournament.teams) {
			newTournament.teams.push(Team.makeTrueCopy(tournament.teams[team]));
		}

		return newTournament;
	}

	convertToJson() {
		let tournament =  {
			tournamentName: this.tournamentName,
			acronym: this.acronym,
			teams: []
		};

		for(let team in this.teams) {
			tournament.teams.push(this.teams[team].convertToJson());
		}

		return tournament;
	}
}
