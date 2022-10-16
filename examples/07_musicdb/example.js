// This example demonstrates pretty much everything, including custom table
// and record classes, pre-defined queries and the use of relations.
import connectMusicDb from "./lib/musicdb.js";

async function main() {
  // connect
  const musicdb = await connectMusicDb();

  // add Pink Floyd as an artist
  const artists = await musicdb.model.artists;
  const floyd   = await artists.insertRecord({ name: 'Pink Floyd' });
  console.log("Added Pink Floyd as artist #%s", floyd.id);

  // add The Dark Side of the Moon album
  const albums = await musicdb.model.albums;
  const dsotm  = await albums.insertRecord({
    title:     'The Dark Side of the Moon',
    artist_id: floyd.id,
    year:      1973,
  });
  console.log("\nAdded The Dark Side of the Moon as album #%s", dsotm.id);

  // add tracks to The Dark Side of the Moon
  const tracks = await musicdb.model.tracks;
  await tracks.insert([
    { album_id: dsotm.id, track_no: 1, title: 'Speak to Me / Breathe' },
    { album_id: dsotm.id, track_no: 2, title: 'On the Run' },
    { album_id: dsotm.id, track_no: 3, title: 'Time' },
    { album_id: dsotm.id, track_no: 4, title: 'The Great Gig in the Sky' },
    { album_id: dsotm.id, track_no: 5, title: 'Money' },
    { album_id: dsotm.id, track_no: 6, title: 'Us and Them' },
    { album_id: dsotm.id, track_no: 7, title: 'Any Colour You Like' },
    { album_id: dsotm.id, track_no: 8, title: 'Brain Damage' },
    { album_id: dsotm.id, track_no: 9, title: 'Eclipse' },
  ]);
  // fetch tracks for The Dark Side of the Moon
  const dsotmTracks = await dsotm.tracks;

  // print track listing
  console.log('Track listing for The Dark Side of the Moon:');
  dsotmTracks.forEach(
    track => console.log("  %s: %s", track.track_no, track.title)
  );

  // add Wish You Were Here, using the artists addAlbum() method
  const wywh = await floyd.addAlbum({
    title: 'Wish You Were Here',
    year:   1975,
  });
  console.log("\nAdded Wish You Were Here as album #%s", wywh.id);

  // add tracks to Wish You Were Here using the Album record insertTracks() method
  // note that we insert them in the wrong order to check they get ordered by track_no
  await wywh.insertTracks([
    { track_no: 4, title: 'Shine On You Crazy Diamond (Parts VI-IX)' },
    { track_no: 3, title: 'Have a Cigar' },
    { track_no: 2, title: 'Welcome to the Machine' },
    { track_no: 1, title: 'Shine On You Crazy Diamond (Parts I-V)' },
  ]);

  // call the Album record trackListing() method
  await wywh.trackListing();

  // Now add Atom Heart Mother using the all-in-one approach
  const ahm = await floyd.addAlbum({
    title: 'Atom Heart Mother',
    year:  1970,
    tracks: [
      { title: 'Atom Heart Mother' },
      { title: 'If' },
      { title: "Summer '68" },
      { title: 'Fat Old Sun' },
      { title: "Alan's Psychedelic Breakfast" },
    ]
  });
  console.log("\nAdded Atom Heart Mother as album #%s", ahm.id);

  // call the Album record trackListing() method
  await ahm.trackListing();

  // now list all Pink Floyd albums - Atom Heart Mother should be first
  await floyd.albumList();

  // now list all album tracks
  await floyd.trackList();

  // disconnect
  musicdb.disconnect();
}

main();

/*
Expected Output:

Added Pink Floyd as artist #1

Added The Dark Side of the Moon as album #1
Track listing for The Dark Side of the Moon:
  1: Speak to Me / Breathe
  2: On the Run
  3: Time
  4: The Great Gig in the Sky
  5: Money
  6: Us and Them
  7: Any Colour You Like
  8: Brain Damage
  9: Eclipse

Added Wish You Were Here as album #2
Track listing for Wish You Were Here:
  1: Shine On You Crazy Diamond (Parts I-V)
  2: Welcome to the Machine
  3: Have a Cigar
  4: Shine On You Crazy Diamond (Parts VI-IX)

Added Atom Heart Mother as album #3
Track listing for Atom Heart Mother:
  1: Atom Heart Mother
  2: If
  3: Summer '68
  4: Fat Old Sun
  5: Alan's Psychedelic Breakfast

Albums by Pink Floyd:
  - Atom Heart Mother (1970)
  - The Dark Side of the Moon (1973)
  - Wish You Were Here (1975)

Album tracks by Pink Floyd:
  - Atom Heart Mother
    Atom Heart Mother (1970) track 1
  - If
    Atom Heart Mother (1970) track 2
  - Summer '68
    Atom Heart Mother (1970) track 3
  - Fat Old Sun
    Atom Heart Mother (1970) track 4
  - Alan's Psychedelic Breakfast
    Atom Heart Mother (1970) track 5
  - Speak to Me / Breathe
    The Dark Side of the Moon (1973) track 1
  - On the Run
    The Dark Side of the Moon (1973) track 2
  - Time
    The Dark Side of the Moon (1973) track 3
  - The Great Gig in the Sky
    The Dark Side of the Moon (1973) track 4
  - Money
    The Dark Side of the Moon (1973) track 5
  - Us and Them
    The Dark Side of the Moon (1973) track 6
  - Any Colour You Like
    The Dark Side of the Moon (1973) track 7
  - Brain Damage
    The Dark Side of the Moon (1973) track 8
  - Eclipse
    The Dark Side of the Moon (1973) track 9
  - Shine On You Crazy Diamond (Parts I-V)
    Wish You Were Here (1975) track 1
  - Welcome to the Machine
    Wish You Were Here (1975) track 2
  - Have a Cigar
    Wish You Were Here (1975) track 3
  - Shine On You Crazy Diamond (Parts VI-IX)
    Wish You Were Here (1975) track 4

*/