import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReminderView } from "./ReminderView";
import { createRoot } from "react-dom/client";
import { AppContext } from "context";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ReminderViewParent extends ItemView {
	reminderDir: string;
	reminderFile: string;
	constructor(leaf: WorkspaceLeaf, reminderDir: string, reminderFile: string) {
		super(leaf);
		this.reminderDir = reminderDir;
		this.reminderFile = reminderFile;
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		const root = createRoot(this.containerEl.children[1]);
		root.render(
			<AppContext.Provider value={this.app}>
				<ReminderView reminder_dir={this.reminderDir} reminder_file={this.reminderFile}/>
			</AppContext.Provider>
		);
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
