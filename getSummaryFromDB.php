<?php
require 'vendor/autoload.php';
use MongoDB\BSON\ObjectId;
include("common.php");

$collection = (new MongoDB\Client)->Novels->Summary;
if (getPost($_POST["bookID"]) != "")
    echo (json_encode($collection->findOne(["_id" => new MongoDB\BSON\ObjectId($_POST["bookID"])])));
else
    echo("");

