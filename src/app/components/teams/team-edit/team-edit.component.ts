import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../models/teams/team';
import { TeamPlayer } from '../../../models/teams/team-player';
import { ToastService } from '../../../services/toast.service';

@Component({
	selector: 'app-team-edit',
	templateUrl: './team-edit.component.html',
	styleUrls: ['./team-edit.component.scss']
})
export class TeamEditComponent implements OnInit {
	originalTeam: Team;
	selectedTeam: Team;

	constructor(private route: ActivatedRoute, private teamService: TeamService, private toastService: ToastService) { 
		this.route.params.subscribe(params => {
			this.selectedTeam = Team.makeTrueCopy(teamService.getTeamByName(params.teamName));
			this.originalTeam = Team.makeTrueCopy(teamService.getTeamByName(params.teamName));
		});
	}

	ngOnInit() { }

	removePlayer(team: Team, player: TeamPlayer) {
		team.removePlayer(player);
	}

	createNewPlayer() {
		this.selectedTeam.addPlayer(new TeamPlayer);
	}

	updateTeam() {
		this.teamService.updateTeam(this.originalTeam, this.selectedTeam);

		this.toastService.addToast(`Successfully updated the team "${this.selectedTeam.teamName}".`);
	}
}
