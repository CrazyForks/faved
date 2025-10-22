<?php

namespace Framework;


use Config;
use Exception;
use Framework\Responses\DataResponse;
use Framework\Responses\PageResponse;
use Framework\Responses\RedirectResponse;
use Models\Repository;

function page($page_name, $data)
{
	return new PageResponse($page_name, $data);
}

function redirect($location, $code = 303)
{
	return new RedirectResponse($location, $code);
}

function data(array $data, $code = 200)
{
	return new DataResponse($data, $code);
}

function flattenRoutesArray(array $array, string $prefix = ''): array
{
	$result = [];

	foreach ($array as $key => $value) {
		$key = trim($key, '/');
		$prefix = rtrim($prefix, '/');
		$new_key = "{$prefix}/{$key}";

		if (is_array($value)) {
			$result += flattenRoutesArray($value, $new_key); // Recursive call
		} else {
			$result[$new_key] = $value;
		}
	}

	return $result;
}

function validatePasswordAndConfirmation(string $password, string $confirm_password)
{
	$password = trim($password);

	if (empty($password)) {
		throw new Exception('New password cannot be empty');
	}

	if (!is_string($password) || strlen($password) < 6) {
		throw new Exception('Password must be at least 6 characters long');
	}

	$confirm_password = trim($confirm_password);

	if (empty($confirm_password)) {
		throw new Exception('Password confirmation cannot be empty');
	}

	if ($password !== $confirm_password) {
		throw new Exception('Password confirmation does not match the new password');
	}
}

function validateUsername(string $username)
{
	$username = trim($username);

	if (empty($username)) {
		throw new Exception('Username cannot be empty');
	}

	if (!is_string($username) || !preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
		throw new Exception('Username format is invalid. Please use alphanumeric characters and underscores.');
	}
}

function startSession(): void
{
	// 7 days
	$session_lifetime = Config::getSessionLifetime();

	session_start([
		'name' => Config::getSessionCookieName(),
		'cookie_lifetime' => $session_lifetime,
		'gc_maxlifetime' => $session_lifetime,
		'cookie_path' => '/',
		'cookie_secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
		'cookie_httponly' => true,
		'cookie_samesite' => 'Lax',
	]);
}

function loginUser(int $user_id): void
{
	if (!isset($_SESSION)) {
		startSession();
	}

	$_SESSION['user_id'] = $user_id;
}

function logoutUser(): void
{
	if (!isset($_SESSION)) {
		return;
	}

	$_SESSION['user_id'] = null;
}

function getLoggedInUser()
{
	if (!isset($_SESSION['user_id'])) {
		return null;
	}

	$repository = ServiceContainer::get(Repository::class);
	return $repository->getUser($_SESSION['user_id']);
}

function isValidHttpCode($http_code)
{
	return is_int($http_code) && $http_code >= 100 && $http_code <= 599;
}
