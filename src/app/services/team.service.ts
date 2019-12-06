import { Injectable } from '@angular/core';
import { Team } from '../models/teams/team';
import { StoreService } from './store.service';
import { TeamPlayer } from '../models/teams/team-player';

@Injectable({
	providedIn: 'root'
})

export class TeamService {
	allTeams: Team[];

	constructor(private storeService: StoreService) { 
		this.allTeams = [];
		
		const allTeamsCache = this.storeService.get(`cache.teams`);

		for(let team in allTeamsCache) {
			const newTeam = new Team();
			newTeam.teamName = allTeamsCache[team].teamName;
			
			for(let player in allTeamsCache[team].teamPlayers) {
				const newPlayer = new TeamPlayer();
				newPlayer.username = allTeamsCache[team].teamPlayers[player].username;

				newTeam.addPlayer(newPlayer);
			}

			this.allTeams.push(newTeam);
		}
	}

	/**
	 * Add a team to the service
	 * @param team the team to add
	 */
	addTeam(team: Team): void {
		this.allTeams.push(team);
		this.storeService.set(`cache.teams.${team.teamName}`, team);
	}

	/**
	 * Remove a team from the service
	 * @param team the team to remove
	 */
	removeTeam(team: Team): void {
		this.allTeams.splice(this.allTeams.indexOf(team), 1);
		this.storeService.delete(`cache.teams.${team.teamName}`);
	}

	/**
	 * Update an existing team with new values
	 * @param oldTeam the original team to update
	 * @param newTeam the new team 
	 */
	updateTeam(oldTeam: Team, newTeam: Team): void {
		for(let team in this.allTeams) {
			if(this.allTeams[team].teamName == oldTeam.teamName) {
				this.allTeams[team] = newTeam;
			}
		}
	}

	/**
	 * Get a team by the given teamname
	 * @param teamName the teamname
	 */
	getTeamByName(teamName: string): Team {
		for(let team of this.allTeams) {
			if(team.teamName == teamName) {
				return team;
			}
		}

		return null;
	}
}
