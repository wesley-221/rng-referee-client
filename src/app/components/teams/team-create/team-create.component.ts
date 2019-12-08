import { Component, OnInit } from '@angular/core';
import { Team } from '../../../models/teams/team';
import { TeamService } from '../../../services/team.service';
import { TeamPlayer } from '../../../models/teams/team-player';
import { ToastService } from '../../../services/toast.service';

@Component({
	selector: 'app-team-create',
	templateUrl: './team-create.component.html',
	styleUrls: ['./team-create.component.scss']
})
export class TeamCreateComponent implements OnInit {
	teamCreate: Team;
	
	constructor(private teamService: TeamService, private toastService: ToastService) { 
		this.teamCreate = new Team();
	}

	ngOnInit() { }

	createNewPlayer() {
		this.teamCreate.addPlayer(new TeamPlayer);
	}

	removePlayer(team: Team, player: TeamPlayer) {
		team.removePlayer(player);
	}

	createTeam() {
		this.teamService.addTeam(this.teamCreate);
		this.toastService.addToast(`Successfully created the team "${this.teamCreate.teamName}" with a total of ${this.teamCreate.getPlayers().length} player(s).`);

		this.teamCreate = new Team();
	}
}
