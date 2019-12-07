import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ElectronService } from '../../services/electron.service';
import { StoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';
import { ToastType } from '../../models/toast';
import { ApiKeyValidation } from '../../services/osu-api/api-key-validation.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
	@ViewChild('apiKey', { static: false }) apiKey: ElementRef;

	constructor(
		public electronService: ElectronService, 
		private storeService: StoreService, 
		private toastService: ToastService,
		private apiKeyValidation: ApiKeyValidation
	) { }
	ngOnInit() { }

	/**
	 * Get the api key
	 */
	getApiKey() {
		return this.storeService.get('api-key');
	}

	/**
	 * Save the api key with the entered value
	 */
	saveApiKey() {
		// Key is valid
		this.apiKeyValidation.validate(this.apiKey.nativeElement.value).subscribe(() => {
			this.storeService.set('api-key', this.apiKey.nativeElement.value);
			this.toastService.addToast('You have entered a valid api-key.', ToastType.Information);
		}, 
		// Key is invalid
		err => {
			this.toastService.addToast('The entered api-key was invalid.', ToastType.Error);
		});
	}

	/**
	 * Clear the cache 
	 */
	clearCache() {
		if(confirm(`Are you sure you want to clear your cache?`)) {
			this.storeService.delete('cache');

			this.toastService.addToast(`Successfully cleared the cache.`);
		}
	}

	/**
	 * Clear irc messages
	 */
	clearIrc() {
		if(confirm(`Are you sure you want to clear your irc messages?`)) {
			this.storeService.delete('irc.channels');

			this.toastService.addToast(`Successfully cleared the irc messages.`);
		}
	}

	/**
	 * Remove the irc credentials
	 */
	removeIrcCredentials() {
		if(confirm(`Are you sure you want to remove your irc credentials?`)) {
			this.storeService.delete('irc.username');
			this.storeService.delete('irc.password');

			this.toastService.addToast(`Successfully removed your irc credentials.`);
		}
	}

	/**
	 * Remove the pai key
	 */
	removeApiKey() {
		if(confirm(`Are you sure you want to remove your api key?`)) {
			this.storeService.delete('api-key');
			
			this.toastService.addToast(`Successfully removed your api key.`);
		}
	}

	/**
	 * Export the config file 
	 */
	exportConfigFile() {
		this.electronService.dialog.showSaveDialog({
			title: 'Export the config file',
			defaultPath: "export.json"
		}).then(file => {
			// Remove the api key and auth properties
			let configFile = this.storeService.storage.store;
			configFile['api-key'] = "redacted";
			configFile['auth'] = "redacted";
			configFile['irc'] = "redacted";

			configFile = JSON.stringify(configFile, null, '\t');

			this.electronService.fs.writeFile(file.filePath, configFile, err => {
				if(err) {
					this.toastService.addToast(`Something went wrong while trying to export the config file: ${err.message}.`, ToastType.Error);
				}
				else {
					this.toastService.addToast(`Successfully saved the config file to "${file.filePath}".`);
				}
			});
		});
	}
}
