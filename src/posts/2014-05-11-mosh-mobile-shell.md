---
title: Mosh (mobile shell)
date_published: 2014-05-11T21:03:18.000Z
date_updated: 2018-04-02T10:50:49.000Z
---

It was quite a good while ago that an acquaintance of mine made me aware of a great alternative to SSH called [Mosh](http://mosh.mit.edu/) (short for mobile shell). Mosh was born out of MIT as a result of a few important factors.

- Latency on the Internet is on the increase
- Roaming has become more common
- SSH does not properly support UTF-8

## Latency

So why is latency on the Internet an issue when using SSH? Well, if you have ever spent time on a connection with high latency you will know the frustration of using SSH. The problem of course is that SSH is designed so that the user's key strokes are passed on to the terminal session at the server and the output buffer from the server is passed back to the client's terminal. On very responsive connections this is of course not an issue. But imagine that there is half a second of delay between your computer and the server. In such an instance it would take a whole second from the time you type a letter till the output of that letter reaches your screen. That kind of delay can be super frustrating. Editing text becomes a chore.

But how does mosh fix this? Well, Mosh uses state synchronisation to synchronise the screen buffer state between the server and the client, and something they call "intelligent local echo". Essentially the mosh client will just echo out to the client terminal what you are typing. If you start erasing text you can see how you are able to erase the username@hostname# before the server catches up and Mosh corrects the client state. Usually you would type sensibly and so not notice any client state corrections.

High response times and slow connections between the client and server can also pose problems when running scripts through SSH that spews out huge quantities of bloat. This is not a very rare occurrence. To combat this problem Mosh only sends the very last part of the screen buffer to the client. More specifically, it sends just as much of the screen buffer as the client terminal can display at any one time. To get access to the whole screen buffer you need to run something like screen or tmux on the server side to navigate through the buffer. By just sending you the last part of the screen buffer the server saves bandwidth and makes the whole thing feel more responsive.

## Roaming

We all know the frustration of loosing our SSH connection because our WIFI-connection broke down, or the VPN server disconnected us, or some other annoying reason. As devices become more portable and we use several connections we've also felt anger about the necessity of disconnecting and reconnecting every time we switch from one network to another. SSH doesn't even care to give us some sort of indication that the connection were lost.

Fortunately Mosh has fixed this as well. Mosh implements a protocol that attempts to reconnect whenever the connection to the Mosh server is lost. Of course security is needed to prevent a random person from hijacking the connection, and this is implemented in the form of a key unique to that session.

## UTF-8

According to the Mosh home page SSH, and some terminals, have UTF-8 bugs were they don't properly support certain UTF-8 characters. They claim that Mosh is implemented to have full UTF-8 support, and that it is built ground up for this character set. I have not personally had problems with UTF-8 encoding in SSH before, but I am sure this is a nice feature for some people.

## Conclusion

I have only been using Mosh for a little while now, but it has already made its way onto my must have Ubuntu server application. The responsiveness and roaming support are its key selling features and make remote terminal use much better! Mosh is available for just about every operating system out there (except some mobile OSs). If you run Ubuntu 14.04 you will be fortunate to find Mosh in the default repositories.
