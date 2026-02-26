<?php
// Настройки отправки
require 'config.php';

// От кого письмо
$mail->setFrom('some@gmail.com', 'Письмо от ЧФ4'); // Указать нужный E-mail
// Кому отправить
$mail->addAddress('some@gmail.com'); // Указать нужный E-mail
// Тема письма
$mail->Subject = 'Привет! Это Чертоги Фрилансера 4';

// Тело письма
$body = '<h1>Встречайте супер письмо!</h1>';

//if(trim(!empty($_POST['email']))){
//$body.=$_POST['email'];
//}	

/*
	// Прикрепить файл
	if (!empty($_FILES['image']['tmp_name'])) {
		// путь загрузки файла
		$filePath = __DIR__ . "/files/sendmail/attachments/" . $_FILES['image']['name']; 
		// грузим файл
		if (copy($_FILES['image']['tmp_name'], $filePath)){
			$fileAttach = $filePath;
			$body.='<p><strong>Фото во вложении</strong>';
			$mail->addAttachment($fileAttach);
		}
	}
*/

$mail->Body = $body;

// Отправляем
if (!$mail->send()) {
	$message = 'Ошибка';
} else {
	$message = 'Данные отправлены!';
}

$response = ['message' => $message];

header('Content-type: application/json');
echo json_encode($response);
