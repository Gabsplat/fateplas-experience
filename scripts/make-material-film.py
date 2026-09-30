"""Make the local editorial film from Fateplas' existing photographs.

This is an animated photo film, not footage of Fateplas' factory. The quiet
soundtrack is synthesized locally; no external footage, tracking or audio.
"""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parent.parent
media = root / "public/media"
media.mkdir(exist_ok=True)
photos = ["crystal-kwok-XUEdfpPIhXg-unsplash-scaled.jpg", "ant-rozetsky-SLIFI67jv5k-unsplash-scaled.jpg", "jim-harris-zDlusnb3G3Q-unsplash-scaled.jpg"]
clips = []
for index, photo in enumerate(photos):
    target = Path(f"/tmp/fateplas-material-film-{index}.mp4")
    clips.append(target)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(root / "public/images" / photo), "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='1.04+on*0.0005':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=100:s=1280x720:fps=25,eq=saturation=0.65:brightness=-0.08,fade=t=in:st=0:d=0.35,fade=t=out:st=3.65:d=0.35", "-frames:v", "100", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", str(target)], check=True)
concat = Path("/tmp/fateplas-material-film.txt")
concat.write_text("".join(f"file '{clip}'\n" for clip in clips))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-f", "lavfi", "-i", "sine=frequency=110:duration=12", "-f", "lavfi", "-i", "sine=frequency=164.81:duration=12", "-filter_complex", "[1:a]volume=0.035[a];[2:a]volume=0.018[b];[a][b]amix=inputs=2,afade=t=in:d=1,afade=t=out:st=10:d=2[sound]", "-map", "0:v", "-map", "[sound]", "-c:v", "copy", "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", str(media / "material-film.mp4")], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(media / "material-film.mp4"), "-ss", "1", "-frames:v", "1", str(media / "material-film-poster.jpg")], check=True)
