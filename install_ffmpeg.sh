
cd /mnt/data
sudo dnf install wget
wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz.md5
md5sum -c ffmpeg-git-amd64-static.tar.xz.md5

tar xvf ffmpeg-git-amd64-static.tar.xz
./ffmpeg-git-20240223-amd64-static/ffmpeg
sudo mv ./ffmpeg-git-20240223-amd64-static/ffmpeg /usr/bin
sudo mv ./ffmpeg-git-20240223-amd64-static/ffprobe /usr/bin