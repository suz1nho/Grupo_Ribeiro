<?php
require_once '../config/database.php';

$db = Database::getInstance()->getConnection();
echo "CONEXÃO OK";
