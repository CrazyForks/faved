<?php

namespace Models;

use Exception;
use PDO;

class Repository
{
	private $pdo;

	public function __construct($pdo)
	{
		$this->pdo = $pdo;
	}

	public function getTags()
	{
		$tags = [];
		$stmt = $this->pdo->query('SELECT * FROM tags ORDER BY title ASC');
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$tags[(int)$row['id']] = $row;
		}
		return $tags;
	}

	public function getItems()
	{
		$items_tags = $this->getItemsTags();

		$items = [];
		$stmt = $this->pdo->query('SELECT * FROM items ORDER BY id DESC');
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$items[(int)$row['id']] = array_merge($row, [
				'tags' => $items_tags[(int)$row['id']] ?? []
			]);
		}
		return $items;
	}

	/**
	 * Get items tags relation
	 */
	public function getItemsTags()
	{
		$items_tags = [];
		$stmt = $this->pdo->query('SELECT item_id, tag_id FROM items_tags ORDER BY tag_id ASC');
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$items_tags[(int)$row['item_id']][] = (int)$row['tag_id'];
		}
		return $items_tags;
	}

	public function getUser(int $user_id)
	{
		$stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = :user_id');
		$stmt->execute([':user_id' => $user_id]);
		return $stmt->fetch(PDO::FETCH_ASSOC);
	}

	public function getUserByUsername(string $username)
	{
		$stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = :username');
		$stmt->execute([':username' => $username]);
		return $stmt->fetch(PDO::FETCH_ASSOC);
	}

	public function userTableNotEmpty(): bool
	{
		$stmt = $this->pdo->query('SELECT 1 FROM users');
		return (bool)$stmt->fetchColumn();
	}

	public function createUser(string $username, string $password_hash)
	{
		$stmt = $this->pdo->prepare(
			'INSERT INTO users (username, password_hash, created_at, updated_at) 
			VALUES (:username, :password_hash, :created_at, :updated_at)'
		);
		$date = date('Y-m-d H:i:s');
		$stmt->execute([
			':username' => $username,
			':password_hash' => $password_hash,
			':created_at' => $date,
			':updated_at' => $date,
		]);
		return $this->pdo->lastInsertId();
	}

	public function deleteUser(int $user_id)
	{
		$stmt = $this->pdo->prepare('DELETE FROM users WHERE id = :user_id');
		return $stmt->execute([':user_id' => $user_id]);
	}

	public function updateUsername(int $user_id, string $username)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE users SET username = :username, updated_at = :updated_at WHERE id = :id'
		);
		return $stmt->execute([
			':username' => $username,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $user_id,
		]);
	}

	public function updatePasswordHash(int $user_id, string $password_hash)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE users SET password_hash = :password_hash, updated_at = :updated_at WHERE id = :id'
		);
		return $stmt->execute([
			':password_hash' => $password_hash,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $user_id,
		]);
	}

	public function updateItemTags(array $item_tags, int $item_id)
	{
		// 1. delete all tags relations
		$this->deleteItemTags($item_id);

		// 2. insert new tags relations
		$this->attachItemTags($item_tags, $item_id);
	}

	public function deleteItemTags(int $item_id)
	{
		$stmt = $this->pdo->prepare('DELETE FROM items_tags WHERE item_id = :item_id');
		$stmt->execute([':item_id' => $item_id]);
	}

	public function attachItemTags(array $item_tags, int $item_id)
	{
		if (empty($item_tags)) {
			return;
		}

		$sql_data = [];

		foreach ($item_tags as $tag_id) {
			array_push($sql_data, $item_id, (int)$tag_id);
		}

		$sql = 'INSERT INTO items_tags (item_id, tag_id) VALUES ' . implode(',', array_fill(0, count($sql_data) / 2, '(?, ?)'));
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($sql_data);
	}

	public function createItem($title, $description, $url, $comments, $image, $created_at = null)
	{
		$stmt = $this->pdo->prepare(
			'INSERT INTO items (title, description, url, comments, image, created_at)
    VALUES (:title, :description, :url, :comments, :image, :created_at)'
		);
		$stmt->execute([
			':title' => $title,
			':description' => $description,
			':url' => $url,
			':comments' => $comments,
			':image' => $image,
			':created_at' => $created_at ?? date('Y-m-d H:i:s'),
		]);
		return $this->pdo->lastInsertId();
	}

	public function updateItem($title, $description, $url, $comments, $image, $item_id)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE items SET title = :title, description = :description, url = :url, comments = :comments, image = :image, updated_at = :updated_at
    WHERE id = :id'
		);
		return $stmt->execute([
			':title' => $title,
			':description' => $description,
			':url' => $url,
			':comments' => $comments,
			':image' => $image,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $item_id,
		]);
	}

	public function updateTagParent($tag_id, $parent_tag_id)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE tags 
			SET parent = :parent, 
			updated_at = :updated_at
			WHERE id = :id'
		);

		return $stmt->execute([
			':parent' => $parent_tag_id,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $tag_id
		]);
	}

	public function updateTagTitle($tag_id, $title)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE tags 
			SET title = :title, 
			updated_at = :updated_at
			WHERE id = :id'
		);

		return $stmt->execute([
			':title' => $title,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $tag_id
		]);
	}

	public function updateTagColor($tag_id, $color)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE tags 
			SET color = :color,
			updated_at = :updated_at
			WHERE id = :id'
		);

		return $stmt->execute([
			':color' => $color,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $tag_id
		]);
	}

	public function updateTagPinned($tag_id, bool $pinned)
	{
		$stmt = $this->pdo->prepare(
			'UPDATE tags 
			SET pinned = :pinned,
			updated_at = :updated_at
			WHERE id = :id'
		);

		return $stmt->execute([
			':pinned' => (int)$pinned,
			':updated_at' => date('Y-m-d H:i:s'),
			':id' => $tag_id
		]);
	}

	public function deleteItemTag($tag_id)
	{
		$stmt = $this->pdo->prepare("DELETE FROM items_tags WHERE tag_id = :tag_id");

		return $stmt->execute([':tag_id' => $tag_id]);

	}

	public function deleteTag($tag_id)
	{
		$stmt = $this->pdo->prepare("DELETE FROM tags WHERE id = :tag_id");

		return $stmt->execute([':tag_id' => $tag_id]);

	}


	public function deleteItem($item_id)
	{
		$stmt = $this->pdo->prepare("DELETE FROM items WHERE id = :item_id");

		return $stmt->execute([':item_id' => $item_id]);

	}

	/**
	 * Check if database tables exist
	 *
	 * @return bool
	 */
	public function checkDatabaseExists()
	{
		try {
			$stmt = $this->pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='items'");
			return $stmt->fetch() !== false;
		} catch (Exception $e) {
			return false;
		}
	}

	/**
	 * Set up database tables
	 *
	 * @return bool
	 */
	public function setupDatabase()
	{
		try {
			// Create items table
			$this->pdo->exec('CREATE TABLE IF NOT EXISTS items (
				id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				url TEXT NOT NULL,
				comments TEXT NOT NULL,
				image TEXT NOT NULL,
				created_at TEXT DEFAULT(NULL),
				updated_at TEXT DEFAULT(NULL)
			)');

			// Create tags table
			$this->pdo->exec('CREATE TABLE IF NOT EXISTS tags (
				id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			   title TEXT NOT NULL,
			   description TEXT NOT NULL,
			   color TEXT NOT NULL,
			   parent INTEGER NOT NULL DEFAULT(0),
			   pinned INTEGER NOT NULL DEFAULT(0),
			   created_at TEXT DEFAULT(NULL),
			   updated_at TEXT DEFAULT(NULL)
			)');

			// Create items_tags relationship table
			$this->pdo->exec('CREATE TABLE IF NOT EXISTS items_tags (
				item_id INTEGER NOT NULL,
				tag_id INTEGER NOT NULL,
				PRIMARY KEY(item_id, tag_id) 
				FOREIGN KEY(item_id) REFERENCES items(id) 
				ON DELETE CASCADE 
				FOREIGN KEY(tag_id) REFERENCES tags(id) 
				ON DELETE CASCADE
			)');

			return true;
		} catch (Exception $e) {
			return false;
		}
	}

	public function migrate()
	{
		if (!$this->checkUsersTableExists() && !$this->setupUsersTable()) {
			throw new Exception('Failed to set up users table');
		}

		if (!$this->checkTagIndexExists() && !$this->createTagIndex()) {
			throw new Exception('Failed to create index on tags');
		}
	}

	public function checkTagIndexExists()
	{
		$stmt = $this->pdo->query("SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'idx_tags_title_parent' AND tbl_name = 'tags';");
		return (bool)$stmt->fetchColumn();

	}
	public function createTagIndex()
	{
		try {
			$this->pdo->exec('CREATE UNIQUE INDEX "idx_tags_title_parent" ON tags(title COLLATE NOCASE ASC, parent COLLATE BINARY ASC);');
			return true;
		} catch (Exception $e) {
			return false;
		}
	}

	/**
	 * Check if users table exists
	 *
	 * @return bool
	 */
	public function checkUsersTableExists()
	{
		try {
			$stmt = $this->pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
			return $stmt->fetch() !== false;
		} catch (Exception $e) {
			return false;
		}
	}

	public function setupUsersTable()
	{
		try {
			// Create users table
			$this->pdo->exec('CREATE TABLE IF NOT EXISTS users (
				id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				created_at TEXT DEFAULT(NULL),
				updated_at TEXT DEFAULT(NULL)
			)');
			return true;
		} catch (Exception $e) {
			return false;
		}
	}

	public function runRawSQL($raw_sql)
	{
		try {
			$this->pdo->exec($raw_sql);
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
}
