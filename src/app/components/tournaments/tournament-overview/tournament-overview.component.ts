import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';
import { TournamentService } from '../../../services/tournaments.service';
import { Tournament } from '../../../models/tournament';
import { AuthenticateService } from '../../../services/authenticate.service';
import { ToastType } from '../../../models/toast';

@Component({
	selector: 'app-tournament-overview',
	templateUrl: './tournament-overview.component.html',
	styleUrls: ['./tournament-overview.component.scss']
})

export class TournamentOverviewComponent implements OnInit {
	tournamentPublishid: number;

	constructor(public tournamentService: TournamentService, private toastService: ToastService, private router: Router, private authService: AuthenticateService) { }

	ngOnInit() { }

	importTeam() {
		this.tournamentService.getPublishedTournament(this.tournamentPublishid).subscribe((data) => {
			const newTournament: Tournament = this.tournamentService.mapFromJson(data);

			this.tournamentService.addTournament(newTournament);
			this.toastService.addToast(`Imported the tournament "${newTournament.tournamentName}".`);
		}, () => {
			this.toastService.addToast(`Unable to import the tournament with the id "${this.tournamentPublishid}".`, ToastType.Error);
		});
	}

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
		return this.authService.loggedIn && ((<any>this.authService.loggedInUser.isTournamentHost) == 'true' || this.authService.loggedInUser.isTournamentHost == true);
	}

	/**
	 * Publish a tournament
	 * @param mappool the mappool to publish
	 */
	publishTournament(tournament: Tournament) {
		if(confirm(`Are you sure you want to publish "${tournament.tournamentName}"?`)) {
			this.tournamentService.publishTournament(tournament).subscribe((data) => {
				this.toastService.addToast(`Successfully published the tournament "${data.body.tournamentName}" with the id ${data.body.id}.`);
			});
		}
	}
}

