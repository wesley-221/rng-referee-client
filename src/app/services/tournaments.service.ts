import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { Tournament } from '../models/tournament';
import { Team } from '../models/teams/team';
import { TeamPlayer } from '../models/teams/team-player';

@Injectable({
	providedIn: 'root'
})

export class TournamentService {
	allTournaments: Tournament[];

	constructor(private storeService: StoreService) {
		this.allTournaments = [];

		const allTournamentsCache = this.storeService.get(`cache.tournaments`);

		for(let tournament in allTournamentsCache) {
			const newTournament = new Tournament();
			newTournament.tournamentName = allTournamentsCache[tournament].tournamentName;
			newTournament.acronym = allTournamentsCache[tournament].acronym;

			for(let team in allTournamentsCache[tournament].teams) {
				const newTeam = new Team();
				newTeam.teamName = allTournamentsCache[tournament].teams[team].teamName;

				for(let player in allTournamentsCache[tournament].teams[team].teamPlayers) {
					const newPlayer = new TeamPlayer();
					newPlayer.username = allTournamentsCache[tournament].teams[team].teamPlayers[player].username;

					newTeam.addPlayer(newPlayer);
				}

				newTournament.addTeam(newTeam);
			}

			this.allTournaments.push(newTournament);
		}
	}

	/**
	 * Add a tournament to the service
	 * @param tournament the tournament to add to the service
	 */
	addTournament(tournament: Tournament): void {
		this.allTournaments.push(tournament);

		this.storeService.set(`cache.tournaments.${tournament.tournamentName}`, tournament.convertToJson());
	}

	/**
	 * Remove a tournament from the service
	 * @param tournament the tournament to remove from the service
	 */
	removeTournament(tournament: Tournament): void {
		this.allTournaments.splice(this.allTournaments.indexOf(tournament), 1);
		this.storeService.delete(`cache.tournaments.${tournament.tournamentName}`);
	}

	/**
	 * Update an existing tournament with new values
	 * @param oldTournament the original tournament to update
	 * @param newTournament the new tournament
	 */
	updateTournament(oldTournament: Tournament, newTournament: Tournament): void {
		for(let tournament in this.allTournaments) {
			if(this.allTournaments[tournament].tournamentName == oldTournament.tournamentName) {
				this.allTournaments[tournament] = newTournament;
			}
		}
	}

	/**
	 * Get a tournament by the given name
	 * @param tournamentName the tournament name
	 */
	getTournamentByName(tournamentName: string): Tournament {
		for(let tournament of this.allTournaments) {
			if(tournament.tournamentName == tournamentName) {
				return tournament;
			}
		}

		return null;
	}

	/**
	 * Get a tournament by the given acronym
	 * @param acronym the tournament acronym
	 */
	getTournamentByAcronym(acronym: string): Tournament {
		for(let tournament of this.allTournaments) {
			if(tournament.acronym == acronym) {
				return tournament;
			}
		}

		return null;
	}

	/**
	 * Get the team from the given tournament by the given name
	 * @param tournament the tournament to search in
	 * @param teamName the team to search for
	 */
	getTeamFromTournamentByName(tournament: Tournament, teamName: string) {
		for(let team of tournament.teams) {
			if(team.teamName == teamName) {
				return team;
			}
		}

		return null;
	}
}
