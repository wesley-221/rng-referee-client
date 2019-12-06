import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../models/teams/team';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-team-overview',
	templateUrl: './team-overview.component.html',
	styleUrls: ['./team-overview.component.scss']
})
export class TeamOverviewComponent implements OnInit {
	teamPublishId: number;

	constructor(public teamService: TeamService, private toastService: ToastService, private router: Router) { 
		console.log(teamService)
	}

	ngOnInit() { }

	importTeams() { }

	deleteTeam(team: Team) {
		if(confirm(`Are you sure you want to delete the team "${team.teamName}"?`)) {
			this.teamService.removeTeam(team);
			this.toastService.addToast(`Successfully deleted the team "${team.teamName}".`);
		}
	}

	editTeam(team: Team) {
		this.router.navigate(['edit-team', team.teamName]);
	}
}
