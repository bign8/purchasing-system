<?php
require_once('./libinc/main_include.php');

$sent = -1; // nothing set
if (!isset($_REQUEST['submit'])) {
	$_REQUEST = array('name'=>'', 'crazyField'=>'', 'type'=>' ', 'feedback'=>'', 'invalid'=>'');
} elseif (isset($_REQUEST['email']) && $_REQUEST['email'] != '') {
	// HACKER! (quietly do nothing)
} elseif (
	(!filter_var($_REQUEST['crazyField'], FILTER_VALIDATE_EMAIL) && $_REQUEST['crazyField'] != $_REQUEST['invalid']) || 
	($_REQUEST['crazyField'] == '')
) {
	$sent = 0; // invalid email
	$_REQUEST['invalid'] = $_REQUEST['crazyField'];
} else {
	$sent = 1; // sending error (2 = success)
	$html  = "<tr><td>Name</td><td>{$_REQUEST['name']}</td></tr>";
	$html .= "<tr><td>Email</td><td>{$_REQUEST['crazyField']}</td></tr>";
	$html .= "<tr><td>Type</td><td>{$_REQUEST['type']}</td></tr>";
	$html .= "<tr><td>Time</td><td>" . date('r') . "</td></tr>";
	session_start(); $sessionID = session_id();
	$html .= "<tr><td>SessionID</td><td>{$sessionID}</td></tr>";
	$html .= "<tr><td>Feedback</td><td>{$_REQUEST['feedback']}</td></tr>";
	$mail = new UAMail();
	$sent = ($mail->notify("Upstream Academy Feedback", '<table>' . $html . '</table>')) ? 2 : 1;
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
	<link href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet" />
	<link rel="stylesheet" href="/css.css">
</head>
<body>
	<div id="wrap">
		<div class="container">
			<div class="header">
				<div class="page-header" style="padding-top:1px">
					<!-- <h1>Upstream Academy Payment <small>Feedback</small></h1> -->
					<img src="/UAlogo.png" alt="Upstream Academy" width="150" />
					<h2>&nbsp;</h2>
				</div>

				<ul class="breadcrumb">
					<li><a href="/">Home</a></li>
					<li>Feedback</li>
				</ul>
			</div>

			<div class="row">
				<div class="col-md-offset-2 col-md-8">
					<?php switch($sent): case 0: // Bad Email ?>
					<div class="alert alert-warning">
						<h4>Invalid Email</h4>
						If you would like to send the form anyway, just click submit again.<br/>
						We will not be able to communicate with you without a valid email.
					</div>
					<?php break; case 1: // Bad server ?>
					<div class="alert alert-danger">
						<h4>Server Error</h4>
						Your response has been <strong>NOT</strong> been submitted to our team.  Please contact us directly at <a href="tel:4064951850">(406) 495-1850</a>
					</div>
					<?php break; case 2: // All Good ?>
					<div class="alert alert-success">
						<h4>Success</h4>
						Your response has been submitted to our team.  Thank you for you feedback.
					</div>
					<?php break; endswitch; ?>

					<form class="form-horizontal" method="post">
						<div class="form-group">
							<label class="control-label col-md-3" for="inputName">Name</label>
							<div class="col-md-9">
								<input type="text" id="inputName" placeholder="Name" class="form-control" name="name" value="<?php echo $_REQUEST['name']; ?>">
							</div>
						</div>
						<div class="form-group">
							<label class="control-label col-md-3" for="inputEmail">Email</label>
							<div class="col-md-9">
								<input type="email" id="inputEmail" placeholder="Email" class="form-control" name="crazyField" value="<?php echo $_REQUEST['crazyField']; ?>">
							</div>
						</div>
						<div class="form-group">
							<label class="control-label col-md-3" for="inputFeedbackType">Type</label>
							<div class="col-md-9">
								<select id="inputFeedbackType" class="form-control" name="type">
									<option <?php if ($_REQUEST['type'][0] == 'Q') echo 'selected="selected"'; ?>>Question</option>
									<option <?php if ($_REQUEST['type'][0] == 'C') echo 'selected="selected"'; ?>>Comment</option>
									<option <?php if ($_REQUEST['type'][0] == 'B') echo 'selected="selected"'; ?>>Bug / Issue</option>
									<option <?php if ($_REQUEST['type'][0] == 'O') echo 'selected="selected"'; ?>>Other (Please indicate below)</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<label class="control-label col-md-3" for="inputFeedback">Feedback</label>
							<div class="col-md-9">
								<textarea rows="5" id="inputFeedback" class="form-control" name="feedback"><?php echo $_REQUEST['feedback']; ?></textarea>
							</div>
						</div>
						<div class="form-actions navbar navbar-default">
							<input type="hidden" name="email" />
							<input type="hidden" name="invalid" value="<?php echo $_REQUEST['invalid']; ?>" />
							<button type="submit" class="btn btn-primary pull-right" name="submit" value="yep" <?php if ($sent == 2) echo "disabled='disabled'"; ?>>Send Feedback</button>
							<a class="btn btn-default" href="feedback.php">Clear</a>
						</div>
					</form>
				</div>
			</div>
		</div> <!-- container -->
		<div id="push"></div>
	</div>
	<div id="footer" class="navbar navbar-default">
		<div class="container">
			<p class="text-muted credit">Copyright &copy; <script type="text/javascript">document.write(new Date().getFullYear())</script> <a href="http://upstreamacademy.com">Upstream Academy</a>.</p>
		</div>
	</div>
</body>
</html>