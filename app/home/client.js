$(function() {
  var FADE_TIME = 150; //1111
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];
  
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $('.usernameInput').focus();
  
  var socket = io();

  //Tells the number of users in chat
  function printNumberOfUsers (msg) {
    var message = '';
    if (msg.numberOfUsers === 1) {
      message += "there's 1 person in chat";
    } else {
      message += "there are " + msg.numberOfUsers + " people in chat";
    }
    log(message);
  }

  //Sets the user username
  function setUsername () {
    username = cleanInput($('.usernameInput').val().trim());
    $('.usernameInput').focus();
    //  username = vm.user.username;
    // If the username is valid
    if (username) {
      $('.login.page').fadeOut();
      $('.chat.page').show();
      $('.login.page').off('click');
       $currentInput = $('.inputMessage').focus();

      // Tell the server your username
      socket.emit('add new user', username); //11212312
    }
  }

   // Sends a message
  function sendMessage () {
    var message = $('.inputMessage').val(); ///`12`12`1
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $('.inputMessage').val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('chat message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

   // Adds the visual chat message to the message list
  function addChatMessage (msg, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(msg);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove(); //123123123
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(msg.username)
      .css('color', getUsernameColor(msg.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(msg.message);

    var typingClass = msg.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', msg.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

    // Adds the visual chat typing message
  function addChatTyping (msg) {
    msg.typing = true;
    msg.message = 'is typing';
    addChatMessage(msg);
  }

    // Removes the visual chat typing message
  function removeChatTyping (msg) {
    getTypingMessages(msg).fadeOut(function () {
      $(this).remove();
    });
  }
    // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
    function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $('.messages').prepend($el);
    } else {
      $('.messages').append($el);
    }
    $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
  }

    // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text(); //1234234345234654756754674567
  }

    // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (msg) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === msg.username;
    });
  }

  // Gets the color of a username through our hash function CHANGE23451235124352345623
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $(window).keydown(function (event) {
    // Auto-focus the current input when a key is typed  werwqerqwerqwerqwerqwerwqer
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

   $('.inputMessage').on('input', function() {
    updateTyping();
  });
     
  // Click events

  // Focus input when clicking anywhere on login page
  $('.login.page').click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $('.inputMessage').click(function () {
    $('.inputMessage').focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (msg) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Juhani's Chat – ";
    log(message, {
      prepend: true
    });
    printNumberOfUsers(msg);
  });

  // Whenever the server emits 'chat message', update the chat body
  socket.on('chat message', function (msg) {
    addChatMessage(msg);
  });

   // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (msg) {
    log(msg.username + ' joined');
    printNumberOfUsers(msg);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (msg) {
    log(msg.username + ' left');
    printNumberOfUsers(msg);
    removeChatTyping(msg);
  });

    // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (msg) {
    addChatTyping(msg);
  });

    // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (msg) {
    removeChatTyping(msg);
  });

  socket.on('disconnect', function () {
    log('you have been disconnected'); 
  });                      ///dsfsdfsdfsdfsdfs

  socket.on('reconnect', function () {
    log('you have been reconnected');
    if (username) {
      socket.emit('add new user', username);
    }
  });

    socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });

});
