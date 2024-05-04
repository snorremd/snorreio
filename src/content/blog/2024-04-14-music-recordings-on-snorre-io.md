---
pubDate: "2024-04-14"
title: "Musical recordings on Snorre.io"
---

I bought a [Focusrite Scarlett 4i4 Gen 4](https://focusrite.com/products/scarlett-4i4) as a christmas present to myself last year.
I've always enjoyed improvising music on my synthesizers, but I never really had the gear to record something properly.
The situation changed with the Scarlett soundcard and I've now started to practice recording my synths with the GarageBand app.

So far I've [recorded one track](/music/2024-04-13-contemplations-synth-neon-scapes) and I'm planning to record more in the future.
I do not predict a regular schedule or high musical talent for these recordings, but I hope you'll enjoy them anyway.
If you find them interesting or enjoyable, please let me know and I'll be more motivated to continue recording and sharing them.

## Distributing my music

For now I'll be sharing my music on two platforms: Soundcloud and my own website.
Soundcloud gives me a good platform to get a bit of reach and allows people to provide feedback.
It is however not privacy friendly and I want to make sure that my music is available to everyone!
That's why I'll also be sharing my music on my own website as well.

Currently I'm using the standard HTML5 audio player to allow playback of the music straight from my website.
There are also download links to the music files in various formats if you want to listen to them in a player of your choice.
The web audio player will select the best format for your device if you choose to play the music directly from my website.

I convert my recordings to the various formats using a simple ffmpeg script.
I've added a function to my shell configuration to make this easier.
  
```zsh
# Convert wav files to other audio formats
function convert_audio() {
    local input="$1"
    local basename="${input:r}"
    
    ffmpeg -i "$input" \
           -c:a flac "${basename}.flac" \
           -c:a libmp3lame -qscale:a 2 "${basename}.mp3" \
           -c:a libvorbis -qscale:a 4 "${basename}.ogg" \
           -c:a aac -b:a 192k "${basename}.m4a"
}

# Create an alias to the function
alias convert_audio='convert_audio'
```

Including an audio player on a web page is not so complicated.
My code for achieving this with Astro boils down to the following:

```jsx
<audio controls class="w-full" preload="none">
  {track.downloads.map((download) => {
    return (
      <source
        src={`https://music.snorre.io/${download.url}`}
        type={`audio/${download.format}`}
      />
    );
  })}
</audio>
```

Here I'm using the `track` object that I pass to the page to render the audio player.
A track can contain multiple downloads, essentially different formats of the same recording.
For each track I include a `source` element with the URL to the music file and the format of the file.
The browser will then select the best format to play based on the capabilities of the device, neat!

In the future I might build a Soundcloud like player for my website using [Wavesurfer][https://wavesurfer.xyz/].
This is a bigger task and I'll have to see if I can find the time to do it.
For now I hope you enjoy the music as it is provided.

## Licensing

See [privacy and license page](/privacy#music) for information on how you can use my music.
I've used the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) for the other content on my website.
For my music I've chosen to keep the rights to myself, but I'm happy to share it with you for personal listening.
All songs can be listened to and downloaded for free on my website in various open DRM-free formats.
If you want to use my music in any other way please [contact me](/contact) and we can discuss it further.