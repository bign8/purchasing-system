<?php
require_once('./libinc/main_include.php');

$sent = -1; // nothing set
if (!isset($_REQUEST['submit'])) {
	$_REQUEST = array('name'=>'', 'crazyField'=>'', 'type'=>' ', 'feedback'=>'', 'invalid'=>'');
} elseif (isset($_REQUEST['email']) && $_REQUEST['email'] != '') {
	// HACKER! (quietly do nothing)
} elseif (!filter_var($_REQUEST['crazyField'], FILTER_VALIDATE_EMAIL) && $_REQUEST['crazyField'] != $_REQUEST['invalid']) {
	$sent = 0; // invalid email
	$_REQUEST['invalid'] = $_REQUEST['crazyField'];
} else {
	$sent = 1; // sending error (2 = success)
	$html  = "<tr><td>Name</td><td>{$_REQUEST['name']}</td></tr>";
	$html .= "<tr><td>Email</td><td>{$_REQUEST['crazyField']}</td></tr>";
	$html .= "<tr><td>Type</td><td>{$_REQUEST['type']}</td></tr>";
	$html .= "<tr><td>Time</td><td>" . date('r') . "</td></tr>";
	$html .= "<tr><td>Feedback</td><td>{$_REQUEST['feedback']}</td></tr>";
	$mail = new UAMail();
	$sent = ($mail->notify("UpstreamAcademy Feedback", '<table>' . $html . '</table>')) ? 2 : 1;
}

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>UA Payment &mdash; Feedback</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link type="text/plain" rel="author" href="/humans.txt" />
	<link href="/favicon.ico" rel="icon" type="image/x-icon" />

	<!-- Bootstrap -->
	<link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css" rel="stylesheet" />
	<link rel="stylesheet" href="/css.css">

	<!-- local live-reload -->
	<script src="http://127.0.0.1:1337/livereload.js"></script>
</head>
<body>
	<div class="container">
		<div class="header">
			<div class="page-header">
				<h1>UpstreamAcademy Payment <small>Feedback</small></h1>
			</div>

			<ul class="breadcrumb">
				<li><a href="/">Home</a></li>
				<li><span class="divider">/</span> Feedback</li>
			</ul>
		</div>

		<div class="row">
			<div class="offset2 span8">
				<?php switch($sent): case 0: // Bad Email ?>
				<div class="alert alert-block">
					<h4>Invalid Email</h4>
					If you would like to send the form anyway, just click submit again.<br/>
					We will not be able to communicate with you without a valid email.
				</div>
				<?php break; case 1: // Bad server ?>
				<div class="alert alert-error alert-block">
					<h4>Server Error</h4>
					Your response has been <strong>NOT</strong> been submitted to our team.  Please contact us directly at <a href="tel:4064951850">(406) 495-1850</a>
				</div>
				<?php break; case 2: // All Good ?>
				<div class="alert alert-success alert-block">
					<h4>Success</h4>
					Your response has been submitted to our team.  Thank you for you feedback.
				</div>
				<?php break; endswitch; ?>

				<form class="form-horizontal" method="post">
					<div class="control-group">
						<label class="control-label" for="inputName">Name</label>
						<div class="controls">
							<input type="text" id="inputName" placeholder="Name" class="input-xlarge" name="name" value="<?php echo $_REQUEST['name']; ?>">
						</div>
					</div>
					<div class="control-group">
						<label class="control-label" for="inputEmail">Email</label>
						<div class="controls">
							<input type="text" id="inputEmail" placeholder="Email" class="input-xlarge" name="crazyField" value="<?php echo $_REQUEST['crazyField']; ?>">
						</div>
					</div>
					<div class="control-group">
						<label class="control-label" for="inputFeedbackType">Type</label>
						<div class="controls">
							<select id="inputFeedbackType" class="input-xlarge" name="type">
								<option <?php if ($_REQUEST['type'][0] == 'Q') echo 'selected="selected"'; ?>>Question</option>
								<option <?php if ($_REQUEST['type'][0] == 'C') echo 'selected="selected"'; ?>>Comment</option>
								<option <?php if ($_REQUEST['type'][0] == 'B') echo 'selected="selected"'; ?>>Bug / Issue</option>
								<option <?php if ($_REQUEST['type'][0] == 'O') echo 'selected="selected"'; ?>>Other (Please indicate below)</option>
							</select>
						</div>
					</div>
					<div class="control-group">
						<label class="control-label" for="inputFeedback">Feedback</label>
						<div class="controls">
							<textarea rows="5" id="inputFeedback" class="input-block-level" name="feedback"><?php echo $_REQUEST['feedback']; ?></textarea>
						</div>
					</div>
					<div class="form-actions">
						<input type="hidden" name="email" />
						<input type="hidden" name="invalid" value="<?php echo $_REQUEST['invalid']; ?>" />
						<button type="submit" class="btn btn-primary" name="submit" value="yep" <?php if ($sent == 2) echo "disabled='disabled'"; ?>>Send Feedback</button>
						<a class="btn" href="/feedback.php">Clear</a>
					</div>
				</form>
			</div>
		</div>

		<!-- <div class="footer">
			<p>Copyright NOW</p>
		</div> -->
	</div> <!-- container -->
</body>
</html>