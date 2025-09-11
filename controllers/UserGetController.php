<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\data;
use function Framework\getLoggedInUser;

class UserGetController implements ControllerInterface
{
	public function __invoke(array $input): ResponseInterface
	{
		// Check if authentication is enabled (any user exists)
		$repository = ServiceContainer::get(Repository::class);
		$auth_enabled = $repository->userTableNotEmpty();

		if (! $auth_enabled) {
			return data([
				'message' => 'User has not been created.',
				'data' => [
					'user' => null,
				],
			], 200);
		}

		$user = getLoggedInUser();

		if( ! $user) {
			return data([
				'message' => 'No user is currently logged in.',
				'data' => [
					'user' => null,
				],
			], 403);
		}

		return data([
			'message' => 'User retrieved successfully.',
			'data' => [
				'user' => array_intersect_key(
					$user,
					array_flip(['id', 'username', 'created_at', 'updated_at'])
				),
			],
		], 200);
	}
}
