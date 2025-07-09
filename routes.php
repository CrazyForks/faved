<?php

use Controllers\ItemCreateUpdateController;
use Controllers\ItemDeleteController;
use Controllers\ItemEditController;
use Controllers\ItemsController;
use Controllers\LoginSubmitController;
use Controllers\LoginViewController;
use Controllers\LogoutSubmitController;
use Controllers\PocketImportRunController;
use Controllers\PocketImportViewController;
use Controllers\SettingsAuthDisableController;
use Controllers\SettingsAuthViewController;
use Controllers\SettingsBookmarkletViewController;
use Controllers\SettingsPasswordUpdateController;
use Controllers\SettingsUserCreateController;
use Controllers\SettingsUsernameUpdateController;
use Controllers\SetupRunController;
use Controllers\SetupViewController;
use Controllers\TagDeleteController;
use Controllers\TagEditController;
use Controllers\TagUpdateController;

return [
	'/' => [
		'GET' => ItemsController::class
	],
	'/login' => [
		'GET' => LoginViewController::class,
		'POST' => LoginSubmitController::class
	],
	'/logout' => [
		'POST' => LogoutSubmitController::class
	],
	'/setup' => [
		'GET' => SetupViewController::class,
		'POST' => SetupRunController::class
	],
	'/tag' => [
		'GET' => TagEditController::class,
		'POST' => TagUpdateController::class,
		'DELETE' => TagDeleteController::class,
	],
	'/item' => [
		'GET' => ItemEditController::class,
		'POST' => ItemCreateUpdateController::class,
		'DELETE' => ItemDeleteController::class,
	],
	'/pocket-import' => [
		'GET' => PocketImportViewController::class,
		'POST' => PocketImportRunController::class,
	],
	'/settings/auth' => [
		'GET' => SettingsAuthViewController::class,
	],
	'/settings/bookmarklet' => [
		'GET' => SettingsBookmarkletViewController::class,
	],
	'/settings/username' => [
		'POST' => SettingsUsernameUpdateController::class,
	],
	'/settings/password' => [
		'POST' => SettingsPasswordUpdateController::class,
	],
	'/settings/create-user' => [
		'POST' => SettingsUserCreateController::class,
	],
	'/settings/delete-user' => [
		'POST' => SettingsAuthDisableController::class,
	],
];
