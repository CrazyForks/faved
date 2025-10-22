<?php
// Load framework files
require_once ROOT_DIR . '/framework/helper-functions.php';
require_once ROOT_DIR . '/framework/Router.php';
require_once ROOT_DIR . '/framework/ControllerInterface.php';
require_once ROOT_DIR . '/framework/Application.php';
require_once ROOT_DIR . '/framework/ServiceContainer.php';
require_once ROOT_DIR . '/framework/FlashMessages.php';
require_once ROOT_DIR . '/framework/CSRFProtection.php';
require_once ROOT_DIR . '/framework/responses/ResponseInterface.php';
require_once ROOT_DIR . '/framework/responses/RedirectResponse.php';
require_once ROOT_DIR . '/framework/responses/DataResponse.php';
require_once ROOT_DIR . '/framework/responses/PageResponse.php';
require_once ROOT_DIR . '/framework/exceptions/NotFoundException.php';
require_once ROOT_DIR . '/framework/exceptions/ValidationException.php';
require_once ROOT_DIR . '/framework/exceptions/DataWriteException.php';
require_once ROOT_DIR . '/framework/exceptions/DatabaseNotFound.php';
require_once ROOT_DIR . '/framework/exceptions/ForbiddenException.php';
require_once ROOT_DIR . '/framework/exceptions/UnauthorizedException.php';
require_once ROOT_DIR . '/framework/middleware/MiddlewareAbstract.php';
require_once ROOT_DIR . '/framework/middleware/CSRFMiddleware.php';
require_once ROOT_DIR . '/framework/middleware/DatabaseMigrations.php';
require_once ROOT_DIR . '/framework/middleware/AuthenticationMiddleware.php';

// Load configuration
require_once ROOT_DIR . '/Config.php';

// Load routes
$routes = require ROOT_DIR . '/routes.php';

// Load routes controllers
foreach (glob(ROOT_DIR . "/controllers/*.php") as $controller_file) {
	require_once $controller_file;
}

use Framework\Application;
use Framework\Middleware\AuthenticationMiddleware;
use Framework\Middleware\CSRFMiddleware;
use Framework\Middleware\DatabaseMigrations;
use function Framework\startSession;

startSession();

date_default_timezone_set('UTC');

/*
 * Bind services
 */

$middleware_classes = [
	CSRFMiddleware::class,
	DatabaseMigrations::class,
	AuthenticationMiddleware::class,
];

$error_redirects = [
];

// Load project-specific files and services
require_once ROOT_DIR . '/init.php';

$path = $_SERVER['SCRIPT_URL'];
$method = $_POST['force-method'] ?? $_SERVER["REQUEST_METHOD"];
$app = new Application($routes, $middleware_classes, $error_redirects);
$app->run($path, $method);