<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\data;

class ItemsUpdateController implements ControllerInterface
{
	public function __invoke(array $input) : ResponseInterface
	{
		if (empty($_GET['item-id'])) {
			return data([
				'success' => false,
				'message' => 'Item ID is required',
			], 400);
		}

		$item_id = $_GET['item-id'];

		$repository = ServiceContainer::get(Repository::class);

		if(!isset($input['tags']) || !is_array($input['tags'])) {
			return throw new ValidationException('Tags must be an array');
		}

		$new_tag_ids = array_map('intval', $input['tags']);

		$tags = $repository->getTags();
		$exising_tag_ids = array_keys($tags);
		if ( array_diff($new_tag_ids, $exising_tag_ids) ) {;
			return throw new ValidationException('Non-existing tags provided');
		}

		$title = $input['title'];
		$description = $input['description'];
		$url = $input['url'];
		$comments = $input['comments'];
		$image = $input['image'];

		$repository->updateItem($title, $description, $url, $comments, $image, $item_id);

		$repository->setItemTags($new_tag_ids, $item_id);

		return data([
			'success' => true,
			'message' => 'Item updated successfully',
			'data' => [
				'item_id' => $item_id,
			]
		]);
	}
}