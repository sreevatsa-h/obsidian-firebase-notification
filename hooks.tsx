import React from "react";
import {AppContext} from "./context";
import {App, FileSystemAdapter} from "obsidian";

export const useApp = (): App | undefined => {
	return React.useContext(AppContext);
};
