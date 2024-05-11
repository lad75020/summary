<?php
require 'vendor/autoload.php';

$collection = (new MongoDB\Client)->Novels->Summary;
$booksFromDB = $collection->find([], ['projection' => ['_id' => 1, 'title' => 1], 'sort' => ['title' => 1],]);
$books = array();
foreach($booksFromDB as $book){
    $books[(string)$book->_id] = $book->title;

}
echo(json_encode($books));

