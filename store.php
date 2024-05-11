<?php
require 'vendor/autoload.php';
use MongoDB\BSON\ObjectId;

include("common.php");

$collection = (new MongoDB\Client)->Novels->Summary;
$item = new stdClass();
$item->title = strtoupper(getPost($_POST["title"]));
$item->author = ucwords(getPost($_POST["author"]));
$item->gemini = getPost($_POST["gemini"]);
$item->chatgpt = getPost($_POST["chatgpt"]);
$item->language = getPost($_POST["lang"]);

$collection->insertOne($item);