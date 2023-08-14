import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Button from '@mui/material/Button';
import {useApp} from "./hooks";
import {FileSystemAdapter, Notice, TAbstractFile, TFile, TFolder} from "obsidian";
import {useEffect, useState} from "react";
import {List, ListItemText, ListItemAvatar, Avatar, ListItem, TextField, IconButton} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import md5 from 'md5';

interface Reminder {
	hash_id: String;
	reminder_name: String;
	reminder_time: String,
	is_repeating: boolean,
	has_happened: boolean,
	is_registered: boolean
}

interface ReminderViewProps {
	reminder_dir: string;
	reminder_file: string;
}


export function ReminderView(props: ReminderViewProps) {
	const App = useApp();
	const Adapter: FileSystemAdapter = App?.vault.adapter as FileSystemAdapter;
	const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
	const [reminderName, setReminderName] = React.useState("");
	const [reminders, setReminders] = React.useState(Array<Reminder>);
	const reminderFileDir = props.reminder_dir;
	const reminderFileName = props.reminder_file;
	const reminderFileFullRelativePath = reminderFileDir + "/" + reminderFileName;
	const [isError, setError] = useState(false);

	const checkOrCreateDir = async () => {



		console.log("Tes: ", Adapter.getBasePath());

		console.log("Checking for reminder directory")
		if (!(await Adapter.exists(reminderFileDir))) {
			console.log("Reminder directory doesn't exist, creating (" + reminderFileDir + ")");
			await Adapter.mkdir(reminderFileDir);
		}

		console.log("Checking for reminder file")
		if (!(await Adapter.exists(reminderFileFullRelativePath))) {
			console.log("Reminder directory doesn't exist, creating (" + reminderFileName + ")")
			await Adapter.write(reminderFileFullRelativePath, "");
		}

		console.log("Folder and File initialized");
	}

	const loadRemindersList = async () => {
		let reminders: string | undefined = await Adapter.read(reminderFileFullRelativePath);

		console.log("Reminders: ", reminders);

		setReminders(JSON.parse(reminders));
	}

	useEffect(() => {
		checkOrCreateDir().then(async () => {
			await loadRemindersList();
		});
	}, [])

	const addData = async () => {
		console.log("Reminder name: ", reminderName);
		console.log("Plugin setting: ", props)
		if (reminderName == null || !reminderName.replace(/\s/g, '').length) {
			new Notice("Reminder cannot be empty", 1000)
			setError(true);
			return;
		} else {
			setError(false);
		}
		console.log("Date: ", value?.toISOString())
		console.log("Reminder name: ", reminderName)
		let md5Hash = md5(value?.toISOString());
		console.log("Hash value: ", md5Hash);
		let newReminders = reminders;
		if (value != null) {
			let newReminder: Reminder = {
				hash_id: md5Hash, reminder_name: reminderName, has_happened: false, is_repeating: false, reminder_time: value.toISOString(), is_registered: false
			}
			newReminders.push(newReminder);
			await updateFile(newReminders);
		}
		setReminders([...newReminders]);
		console.log(newReminders);
	}

	const deleteReminder = async (index: number) => {
		let newReminders = reminders;
		newReminders.splice(index, 1);
		setReminders([...newReminders])
		await updateFile(newReminders);
	}

	const updateFile = async (newReminders: Array<Reminder>) => {
		try {
			await Adapter.write(reminderFileFullRelativePath, JSON.stringify(newReminders));
		} catch (e) {
			console.log("File creation failed ", e);
		}
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
				<DateTimePicker
					label="Reminder Time"
					value={value}
					onChange={(newValue) => setValue(newValue)}
				/>

				<TextField id="outlined-basic" label="Reminder Name" variant="outlined" error={isError} onChange={(newValue) => setReminderName(newValue.target.value)}/>

				<Button variant="contained" onClick={addData}>Create Reminder</Button>

				{
					reminders.length > 0 ? <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
						{
							reminders.map((reminder, index) => {
								let reminderTime: Dayjs = dayjs(reminder.reminder_time);
								return <ListItem secondaryAction={
									<IconButton edge="end" aria-label="delete" onClick={() => deleteReminder(index)}>
										<DeleteIcon />
									</IconButton>
								}>
									<ListItemText primary={reminder.reminder_name} secondary={
										"Time: " + reminderTime.format("hh:mm A") + " --- " +
										"Registered?: " + (reminder.is_registered == true? "Yes" : "No")
									} />
								</ListItem>
							})
						}
					</List> : null
				}

			</DemoContainer>
		</LocalizationProvider>
	);
}
