import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TournamentService } from '../../../services/tournaments.service';
import { Tournament } from '../../../models/tournament';
import { TeamPlayer } from '../../../models/teams/team-player';
import { Team } from '../../../models/teams/team';
import { ToastService } from '../../../services/toast.service';

@Component({
	selector: 'app-tournament-edit',
	templateUrl: './tournament-edit.component.html',
	styleUrls: ['./tournament-edit.component.scss']
})
export class TournamentEditComponent implements OnInit {
	originalTournament: Tournament;
	tournamentEdit: Tournament;

	constructor(private route: ActivatedRoute, private tournamentService: TournamentService, private toastService: ToastService) {
		this.route.params.subscribe(params => {
			this.originalTournament = tournamentService.getTournamentByName(params.tournamentId);
			this.tournamentEdit = Tournament.makeTrueCopy(this.originalTournament);
		});
	}

	ngOnInit() { }

	/**
	 * Add a team to the tournament
	 */
	addTeam() {
		this.tournamentEdit.addTeam(new Team());
	}

	/**
	 * Delete a team from the tournament
	 * @param team the team to remove
	 */
	deleteTeam(team: Team) {
		this.tournamentEdit.removeTeam(team);
	}

	/**
	 * Collapse a team bracket
	 * @param team the team bracket to collapse
	 */
	collapseBracket(team: Team) {
		team.collapsed = !team.collapsed;
	}

	/**
	 * Add a player to the given team
	 * @param team the team to add the player to
	 */
	addNewPlayer(team: Team) {
		team.addPlayer(new TeamPlayer());
	}

	/**
	 * Remove a player from the given team
	 * @param team the team to remove a player from
	 * @param player the player to remove from the team
	 */
	removePlayer(team: Team, player: TeamPlayer) {
		team.removePlayer(player);
	}

	updateTournament() {
		this.tournamentService.updateTournament(this.originalTournament, this.tournamentEdit);
		this.toastService.addToast(`Successfully updated the tournament "${this.tournamentEdit.tournamentName}".`);
	}
}
