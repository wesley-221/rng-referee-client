import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';
import { TournamentService } from '../../../services/tournaments.service';
import { Tournament } from '../../../models/tournament';
import { AuthenticateService } from '../../../services/authenticate.service';

@Component({
	selector: 'app-tournament-overview',
	templateUrl: './tournament-overview.component.html',
	styleUrls: ['./tournament-overview.component.scss']
})

export class TournamentOverviewComponent implements OnInit {
	tournamentPublishid: number;

	constructor(public tournamentService: TournamentService, private toastService: ToastService, private router: Router, private authService: AuthenticateService) { }

	ngOnInit() { }

	importTeams() { }

	deleteTournament(tournament: Tournament) {
		if(confirm(`Are you sure you want to delete the tournament "${tournament.tournamentName}"?`)) {
			this.tournamentService.removeTournament(tournament);
			this.toastService.addToast(`Successfully deleted the tournament "${tournament.tournamentName}".`);
		}
	}

	editTournament(tournament: Tournament) {
		this.router.navigate(['edit-tournament', tournament.tournamentName]);
	}

	canPublish() {
		return this.authService.loggedIn && ((<any>this.authService.loggedInUser.isAdmin) == 'true' || this.authService.loggedInUser.isAdmin == true);
	}

	/**
	 * Publish a tournament
	 * @param mappool the mappool to publish
	 */
	publishTournament(tournament: Tournament) {
		if(confirm(`Are you sure you want to publish "${tournament.tournamentName}"?`)) {
			// this.tournamentService.publishTournament(tournament).subscribe((data) => {
			// 	// this.toastService.addToast(`Successfully published the mappool "${data.body.name}" with the id ${data.body.id}.`);
			// });
		}
	}
}

