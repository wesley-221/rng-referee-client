import { Component, OnInit } from '@angular/core';
import { MappoolService } from '../../../services/mappool.service';
import { Mappool } from '../../../models/osu-mappool/mappool';
import { ModBracket } from '../../../models/osu-mappool/mod-bracket';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { AuthenticateService } from '../../../services/authenticate.service';
import { ToastType } from '../../../models/toast';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-mappool-overview',
	templateUrl: './mappool-overview.component.html',
	styleUrls: ['./mappool-overview.component.scss']
})

export class MappoolOverviewComponent implements OnInit {
	mappoolId: string;

	constructor(public mappoolService: MappoolService, private router: Router, private toastService: ToastService, public authService: AuthenticateService) { }
	ngOnInit() { }

	/**
	 * Delete a mappool from the bottom of the earth
	 * @param mappool the mappool
	 */
	deleteMappool(mappool: Mappool) {
		if(confirm(`Are you sure you want to delete "${mappool.name}"?`)) {
			this.mappoolService.deleteMappool(mappool);
		}
	}

	/**
	 * Navigate to the edit page
	 * @param mappool the mappool to navigate to
	 * @param bracket the bracket to navigate to
	 */
	editBracket(mappool: Mappool, bracket: ModBracket) {
		this.router.navigate(['edit-bracket', mappool.id, bracket.id]);
	}

	canPublish() {
		return this.authService.loggedIn && (<any>this.authService.loggedInUser.isAdmin) == 'true';
	}

	/**
	 * Publish a mappool
	 * @param mappool the mappool to publish
	 */
	publishMappool(mappool: Mappool) {
		if(confirm(`Are you sure you want to publish "${mappool.name}"?`)) {

			console.log(mappool);

			this.mappoolService.publishMappool(mappool).subscribe((data) => {
				this.toastService.addToast(`Successfully published the mappool "${data.body.name}" with the id ${data.body.id}.`);
			});
		}
	}

	/**
	 * Import a mappool from the entered mappool id
	 */
	importMappool() {
		this.mappoolService.getPublishedMappool(this.mappoolId).subscribe((data) => {
			const newMappool: Mappool = this.mappoolService.mapFromJson(data);
			newMappool.id = this.mappoolService.availableMappoolId;

			this.mappoolService.saveMappool(newMappool);
			this.toastService.addToast(`Imported the mappool "${newMappool.name}".`);
		}, () => {
			this.toastService.addToast(`Unable to import the mappool with the id "${this.mappoolId}".`, ToastType.Error);
		});
	}
}
