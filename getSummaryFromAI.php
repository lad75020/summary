<?php
require 'vendor/autoload.php';
use GeminiAPI\Client;
use GeminiAPI\Enums\HarmCategory;
use GeminiAPI\Enums\HarmBlockThreshold;
use GeminiAPI\GenerationConfig;
use GeminiAPI\Resources\Parts\TextPart;
use GeminiAPI\SafetySetting;

include "common.php";
include "include.php";

$test = getPost($_POST['title']);
if (getPost($_POST['title']) != "" && getPost($_POST['length']) > 500 && getPost($_POST['temp']) > 0 && getPost($_POST['temp']) < 20 && getPost($_POST['providers']) !=0) {
    $title = getPost($_POST["title"]);
    $author = getPost($_POST['author']);
    $book = new stdClass();
    $book->title = strtoupper($title);
    $book->author = ucwords($author);
    $book->gemini = "";
    $book->chatgpt = "";

    $openai = OpenAI::client(__OPENAI_API_KEY__);
    $gemini = new Client(__GEMINI_API_KEY__);

    $gemsummary = $gemini->geminiPro()->generateContent(
        new TextPart("Does the phrase '".$title."' mean anything in any language? Answer with 'yes' or 'no' only."),
    );
    $validText = $gemsummary->text();
    if(strtoupper($validText) == "YES"){
        $prompt = 'Write a ' . $_POST['length'] . ' word summary of the book called "' . $title . '"';

            if ($author != "") {
                $prompt .= " by " . $author;
            } else {
            
                $authorres = $gemini->geminiPro()->generateContent(
                            new TextPart('Who is the author of the book called "' . $title . '" ? Your answer should contain only the name of the author.'),
                        );
                $prompt .= " by " . $authorres->text();
                $author = $authorres->text();
            }
            $book->author = $author;
            if (getPost($_POST["language"]) == "fr")
                $prompt .= " in French.";
            elseif (getPost($_POST["language"]) == "es")
                $prompt .= " in Spanish.";
            elseif(getPost($_POST["language"]) == "cn")
                $prompt .= " in Mandarin chinese.";
            elseif(getPost($_POST["language"]) == "de")
                $prompt .= " in German.";
            else
                $prompt .= " in English.";

            if ($_POST['providers'] == 2 || $_POST['providers'] == 3){
                $oaisummary = $openai->chat()->create([
                    'model' => 'gpt-4',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => getPost($_POST["temp"]) / 10,
                ]);
                $book->chatgpt = $oaisummary->choices[0]->message->content;
            }
              
            if ($_POST['providers'] == 1 || $_POST['providers'] == 3){
                $safetySetting = new SafetySetting(
                    HarmCategory::HARM_CATEGORY_HATE_SPEECH,
                    HarmBlockThreshold::BLOCK_LOW_AND_ABOVE,
                );
                
                $generationConfig = (new GenerationConfig())
                    ->withCandidateCount(1)
                    ->withMaxOutputTokens(1024)
                    ->withTemperature(getPost($_POST["temp"]) / 10)
                    ->withTopK(40)
                    ->withTopP(0.6)
                    ->withStopSequences(['STOP']);

                $gemsummary = $gemini->geminiPro()
                ->withAddedSafetySetting($safetySetting)
                ->withGenerationConfig($generationConfig)
                ->generateContent(
                    new TextPart($prompt),
                );
                $book->gemini = $gemsummary->text();
            }
        }
        else{
            $book->title = "???";
            $book->author = "Unknown";
            $book->gemini = "Title does not seem to mean anything in any language.";
            $book->chatgpt = "Title does not seem to mean anything in any language.";
        }
        echo(json_encode($book));
    }
    else die("NA");