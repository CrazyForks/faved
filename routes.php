<?php

use Controllers\AppInfoController;
use Controllers\AuthLoginController;
use Controllers\AuthLogoutController;
use Controllers\ImportBookmarksController;
use Controllers\ImportPocketController;
use Controllers\ItemsCreateController;
use Controllers\ItemsDeleteController;
use Controllers\ItemsGetController;
use Controllers\ItemsUpdateController;
use Controllers\SetupDatabaseController;
use Controllers\TagsController;
use Controllers\TagsCreateController;
use Controllers\TagsDeleteController;
use Controllers\TagsUpdateColorController;
use Controllers\TagsUpdatePinnedController;
use Controllers\TagsUpdateTitleController;
use Controllers\UrlMetadataController;
use Controllers\UserCreateController;
use Controllers\UserDeleteController;
use Controllers\UserGetController;
use Controllers\UserPasswordUpdateController;
use Controllers\UserUsernameUpdateController;

return [
	'api' => [
		'items' => [
			'GET' => ItemsGetController::class,
			'POST' => ItemsCreateController::class,
			'PATCH' => ItemsUpdateController::class,
			'DELETE' => ItemsDeleteController::class,
		],
		'tags' => [
			'/' => [
				'GET' => TagsController::class,
				'POST' => TagsCreateController::class,
				'DELETE' => TagsDeleteController::class,
			],
			'update-pinned' => [
				'PATCH' => TagsUpdatePinnedController::class,
			],
			'update-title' => [
				'PATCH' => TagsUpdateTitleController::class,
			],
			'update-color' => [
				'PATCH' => TagsUpdateColorController::class,
			],
		],
		'settings' => [
			'user' => [
				'GET' => UserGetController::class,
				'POST' => UserCreateController::class,
				'DELETE' => UserDeleteController::class,
			],
			'username' => [
				'PATCH' => UserUsernameUpdateController::class,
			],
			'password' => [
				'PATCH' => UserPasswordUpdateController::class,
			],
		],
		'auth' => [
			'login' => [
				'POST' => AuthLoginController::class,
			],
			'logout' => [
				'POST' => AuthLogoutController::class
			],
		],
		'setup' => [
			'database' => [
				'POST' => SetupDatabaseController::class
			],
		],
		'import' => [
			'pocket' => [
				'POST' => ImportPocketController::class,
			],
			'bookmarks' => [
				'POST' => ImportBookmarksController::class,
			],
		],
		'url-metadata' => [
			'GET' => UrlMetadataController::class,
		],
		'app-info' => [
			'GET' => AppInfoController::class,
		],
	]
];
