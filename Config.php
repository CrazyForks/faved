<?php
declare(strict_types=1);

class Config
{
	protected const string DB_NAME_DEFAULT = 'faved';
	protected const string STORAGE_DIR = ROOT_DIR . '/storage';

	public static function getDBPath()
	{
		$db_name = $_SERVER['DB_NAME'] ?? self::DB_NAME_DEFAULT;
		return sprintf('%s/%s.db', self::STORAGE_DIR, $db_name);
	}

	public static function getPasswordAlgo()
	{
		if (in_array(PASSWORD_ARGON2ID, password_algos())) {
			return PASSWORD_ARGON2ID;
		}
		return PASSWORD_DEFAULT;
	}

	public static function getSessionLifetime(): int
	{
		return 60 * 60 * 24 * 7; // 7 days
	}

	public static function getSessionCookieName(): string
	{
		return 'faved-session';
	}
}
