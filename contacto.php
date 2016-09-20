<?php
if(isset($_POST['email'])) {
	session_start();


	// Debes editar las próximas dos líneas de código de acuerdo con tus preferencias
	$email_to = "contacto@piranimarcos.esy.es";
	$email_subject = "Contacto desde el sitio web -> ".$_POST['asunto'] ;

	// Aquí se deberían validar los datos ingresados por el usuario
	if(!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['message'])) {
		$_SESSION['env'] = 'no';
		header('Location: index.php#contact');
		die();
	}

	$email_message = "Detalles del formulario de contacto:\n\n";
	$email_message .= "Nombre: " . $_POST['name'] . "\n";
	$email_message .= "E-mail: " . $_POST['email'] . "\n";
	$email_message .= "Asunto: " . $_POST['subject'] . "\n";
	$email_message .= "Mensaje: " . $_POST['message'] . "\n\n";


	// Ahora se envía el e-mail usando la función mail() de PHP
	$headers = 'From: '.$email_from."\r\n".
	'Reply-To: '.$email_from."\r\n" .
	'X-Mailer: PHP/' . phpversion();
	$contacto = mail($email_to, $email_subject, $email_message, $headers);
	if ($contacto) {
		$_SESSION['env'] = 'yes';
		header('Location: index.php#contact');
	}
}
?>