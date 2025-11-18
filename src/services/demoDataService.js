/**
 * 演示数据服务 - 预缓存的高质量YouTube视频数据
 * 让创作者跳过数据抓取，直接体验Master Prompt v2.2的分析能力
 */

class DemoDataService {
  constructor() {
    this.demoVideos = {
      // 1. 经典音乐MV - Rick Astley
      'dQw4w9WgXcQ': {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoId: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)',
        channelName: 'Rick Astley',
        channelUrl: 'https://www.youtube.com/@RickAstleyYT',
        description: '经典80年代流行歌曲，全球网络文化现象的代表作品。这首歌因为"Rickrolling"梗而重新焕发生机，展现了经典内容在数字时代的传播力量。',
        viewCount: '1,400,000,000+',
        likeCount: '16M',
        commentCount: '3.2M',
        duration: '3:33',
        publishDate: '2009-10-25',
        category: 'Music',
        tags: ['Rick Astley', 'Never Gonna Give You Up', '80s music', 'pop music', 'rickroll'],
        thumbnails: {
          maxres: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          high: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          medium: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
        },
        hasSubtitles: true,
        srtContent: `1
00:00:01,360 --> 00:00:03,040
[♪♪♪]

2
00:00:18,640 --> 00:00:21,880
♪ We're no strangers to love ♪

3
00:00:22,640 --> 00:00:26,960
♪ You know the rules
and so do I ♪

4
00:00:26,960 --> 00:00:30,320
♪ A full commitment's
what I'm thinking of ♪

5
00:00:30,320 --> 00:00:34,600
♪ You wouldn't get this
from any other guy ♪

6
00:00:34,680 --> 00:00:38,520
♪ I just wanna tell you
how I'm feeling ♪

7
00:00:38,520 --> 00:00:41,640
♪ Gotta make you understand ♪

8
00:00:41,640 --> 00:00:44,920
♪ Never gonna give you up ♪

9
00:00:44,920 --> 00:00:48,160
♪ Never gonna let you down ♪

10
00:00:48,160 --> 00:00:51,520
♪ Never gonna run around
and desert you ♪

11
00:00:51,520 --> 00:00:54,800
♪ Never gonna make you cry ♪

12
00:00:54,800 --> 00:00:58,040
♪ Never gonna say goodbye ♪

13
00:00:58,040 --> 00:01:02,320
♪ Never gonna tell a lie
and hurt you ♪

14
00:01:02,320 --> 00:01:06,160
♪ We've known each other
for so long ♪

15
00:01:06,160 --> 00:01:09,840
♪ Your heart's been aching,
but you're too shy to say it ♪

16
00:01:09,840 --> 00:01:13,080
♪ Inside, we both know
what's been going on ♪

17
00:01:13,080 --> 00:01:17,360
♪ We know the game
and we're gonna play it ♪

18
00:01:17,440 --> 00:01:21,280
♪ And if you ask me
how I'm feeling ♪

19
00:01:21,280 --> 00:01:24,400
♪ Don't tell me you're too blind to see ♪

20
00:01:24,400 --> 00:01:27,680
♪ Never gonna give you up ♪

21
00:01:27,680 --> 00:01:30,920
♪ Never gonna let you down ♪

22
00:01:30,920 --> 00:01:34,280
♪ Never gonna run around
and desert you ♪

23
00:01:34,280 --> 00:01:37,560
♪ Never gonna make you cry ♪

24
00:01:37,560 --> 00:01:40,800
♪ Never gonna say goodbye ♪

25
00:01:40,800 --> 00:01:45,080
♪ Never gonna tell a lie
and hurt you ♪

26
00:01:45,080 --> 00:01:48,360
♪ Never gonna give you up ♪

27
00:01:48,360 --> 00:01:51,600
♪ Never gonna let you down ♪

28
00:01:51,600 --> 00:01:54,960
♪ Never gonna run around
and desert you ♪

29
00:01:54,960 --> 00:01:58,240
♪ Never gonna make you cry ♪

30
00:01:58,240 --> 00:02:01,480
♪ Never gonna say goodbye ♪

31
00:02:01,480 --> 00:02:05,760
♪ Never gonna tell a lie
and hurt you ♪

32
00:02:05,760 --> 00:02:09,600
♪ We've known each other
for so long ♪

33
00:02:09,600 --> 00:02:13,280
♪ Your heart's been aching,
but you're too shy to say it ♪

34
00:02:13,280 --> 00:02:16,520
♪ Inside, we both know
what's been going on ♪

35
00:02:16,520 --> 00:02:20,800
♪ We know the game
and we're gonna play it ♪

36
00:02:20,880 --> 00:02:24,720
♪ I just wanna tell you
how I'm feeling ♪

37
00:02:24,720 --> 00:02:27,840
♪ Gotta make you understand ♪

38
00:02:27,840 --> 00:02:31,120
♪ Never gonna give you up ♪

39
00:02:31,120 --> 00:02:34,360
♪ Never gonna let you down ♪

40
00:02:34,360 --> 00:02:37,720
♪ Never gonna run around
and desert you ♪

41
00:02:37,720 --> 00:02:41,000
♪ Never gonna make you cry ♪

42
00:02:41,000 --> 00:02:44,240
♪ Never gonna say goodbye ♪

43
00:02:44,240 --> 00:02:48,520
♪ Never gonna tell a lie
and hurt you ♪

44
00:02:48,520 --> 00:02:51,800
♪ Never gonna give you up ♪

45
00:02:51,800 --> 00:02:55,040
♪ Never gonna let you down ♪

46
00:02:55,040 --> 00:02:58,400
♪ Never gonna run around
and desert you ♪

47
00:02:58,400 --> 00:03:01,680
♪ Never gonna make you cry ♪

48
00:03:01,680 --> 00:03:04,920
♪ Never gonna say goodbye ♪

49
00:03:04,920 --> 00:03:09,200
♪ Never gonna tell a lie
and hurt you ♪

50
00:03:09,200 --> 00:03:12,480
♪ Never gonna give you up ♪

51
00:03:12,480 --> 00:03:15,720
♪ Never gonna let you down ♪

52
00:03:15,720 --> 00:03:19,080
♪ Never gonna run around
and desert you ♪

53
00:03:19,080 --> 00:03:22,360
♪ Never gonna make you cry ♪

54
00:03:22,360 --> 00:03:25,600
♪ Never gonna say goodbye ♪

55
00:03:25,600 --> 00:03:29,880
♪ Never gonna tell a lie
and hurt you ♪`
      },

      // 2. 科技教育类视频
      'jNQXAC9IVRw': {
        url: 'https://youtu.be/jNQXAC9IVRw',
        videoId: 'jNQXAC9IVRw',
        title: 'How AI Will Change Everything',
        channelName: 'TechExplained',
        channelUrl: 'https://www.youtube.com/@TechExplained',
        description: '深度解析人工智能如何重塑各个行业，从创意内容到科学研究，AI正在改变我们工作和生活的方式。',
        viewCount: '2,800,000',
        likeCount: '125K',
        commentCount: '8.5K',
        duration: '15:42',
        publishDate: '2024-03-15',
        category: 'Science & Technology',
        tags: ['AI', 'artificial intelligence', 'technology', 'future', 'innovation'],
        thumbnails: {
          maxres: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
          high: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
          medium: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg'
        },
        hasSubtitles: true,
        srtContent: `1
00:00:00,000 --> 00:00:03,000
In the next fifteen minutes, I'm going to show you

2
00:00:03,000 --> 00:00:06,500
how artificial intelligence is about to fundamentally change

3
00:00:06,500 --> 00:00:09,000
every aspect of human civilization.

4
00:00:09,500 --> 00:00:12,000
We're living through the most transformative period

5
00:00:12,000 --> 00:00:14,500
in human history since the industrial revolution.

6
00:00:15,000 --> 00:00:18,000
And most people have no idea what's coming.

7
00:00:18,500 --> 00:00:21,000
Let's start with content creation.

8
00:00:21,500 --> 00:00:24,000
AI can now generate videos, write scripts,

9
00:00:24,000 --> 00:00:26,500
compose music, and create art

10
00:00:26,500 --> 00:00:29,000
that's indistinguishable from human work.

11
00:00:29,500 --> 00:00:32,000
But this is just the beginning.

12
00:00:32,500 --> 00:00:35,000
The real revolution is happening in healthcare.

13
00:00:35,500 --> 00:00:38,000
AI can now diagnose diseases faster

14
00:00:38,000 --> 00:00:40,500
and more accurately than human doctors.

15
00:00:41,000 --> 00:00:43,500
In education, AI tutors are providing

16
00:00:43,500 --> 00:00:46,000
personalized learning experiences

17
00:00:46,000 --> 00:00:48,500
that adapt to each student's needs.

18
00:00:49,000 --> 00:00:51,500
The transportation industry is being revolutionized

19
00:00:51,500 --> 00:00:54,000
by autonomous vehicles and smart logistics.

20
00:00:54,500 --> 00:00:57,000
But here's what most people don't understand:

21
00:00:57,500 --> 00:01:00,000
We're not just talking about incremental improvements.

22
00:01:00,500 --> 00:01:03,000
We're talking about exponential change.

23
00:01:03,500 --> 00:01:06,000
The pace of AI development is accelerating

24
00:01:06,000 --> 00:01:08,500
faster than most experts predicted.

25
00:01:09,000 --> 00:01:11,500
What took decades before now happens in months.

26
00:01:12,000 --> 00:01:14,500
And this creates both incredible opportunities

27
00:01:14,500 --> 00:01:17,000
and unprecedented challenges.

28
00:01:17,500 --> 00:01:20,000
The question isn't whether AI will change everything.

29
00:01:20,500 --> 00:01:23,000
The question is how fast it will happen

30
00:01:23,000 --> 00:01:25,500
and whether we'll be ready for it.`
      },

      // 3. 创意生活方式内容
      'kJQP7kiw5Fk': {
        url: 'https://youtu.be/kJQP7kiw5Fk',
        videoId: 'kJQP7kiw5Fk',
        title: '24 Hours Living Like a Minimalist | Life-Changing Experiment',
        channelName: 'LifestyleExperiments',
        channelUrl: 'https://www.youtube.com/@LifestyleExperiments',
        description: '我用24小时体验了极简主义生活方式，结果完全改变了我对生活的看法。这个实验揭示了我们真正需要的东西有多少。',
        viewCount: '1,200,000',
        likeCount: '87K',
        commentCount: '12.3K',
        duration: '12:28',
        publishDate: '2024-06-20',
        category: 'People & Blogs',
        tags: ['minimalism', 'lifestyle', 'experiment', 'life hacks', 'productivity'],
        thumbnails: {
          maxres: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
          high: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
          medium: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg'
        },
        hasSubtitles: true,
        srtContent: `1
00:00:00,000 --> 00:00:03,000
What if I told you that everything you think you need

2
00:00:03,000 --> 00:00:05,500
to be happy might actually be holding you back?

3
00:00:06,000 --> 00:00:08,500
Today, I'm challenging myself to live

4
00:00:08,500 --> 00:00:11,000
with only the absolute essentials for 24 hours.

5
00:00:11,500 --> 00:00:14,000
No smartphone, no fancy gadgets,

6
00:00:14,000 --> 00:00:16,500
just the bare minimum to survive and thrive.

7
00:00:17,000 --> 00:00:19,500
The rules are simple: if I don't absolutely need it

8
00:00:19,500 --> 00:00:22,000
to stay alive, healthy, and productive today,

9
00:00:22,000 --> 00:00:23,500
it's off limits.

10
00:00:24,000 --> 00:00:26,500
I'm starting by removing everything from my room

11
00:00:26,500 --> 00:00:28,000
except the bare essentials.

12
00:00:28,500 --> 00:00:31,000
One set of clothes, basic toiletries,

13
00:00:31,000 --> 00:00:33,500
a notebook, and a pen.

14
00:00:34,000 --> 00:00:36,500
Already, I'm feeling a strange sense of clarity.

15
00:00:37,000 --> 00:00:39,500
Without the visual clutter, my mind feels clearer too.

16
00:00:40,000 --> 00:00:42,500
For breakfast, I'm having the simplest meal possible:

17
00:00:42,500 --> 00:00:45,000
oatmeal with water and a banana.

18
00:00:45,500 --> 00:00:48,000
No fancy ingredients, no complicated recipes.

19
00:00:48,500 --> 00:00:51,000
And you know what? It tastes incredible.

20
00:00:51,500 --> 00:00:54,000
When you're not distracted by a million options,

21
00:00:54,000 --> 00:00:56,500
you actually taste your food.

22
00:00:57,000 --> 00:00:59,500
The hardest part is resisting the urge

23
00:00:59,500 --> 00:01:02,000
to check my phone every five minutes.

24
00:01:02,500 --> 00:01:05,000
Instead, I'm writing in my notebook,

25
00:01:05,000 --> 00:01:07,500
and the thoughts flowing onto paper

26
00:01:07,500 --> 00:01:10,000
are more focused than they've been in months.

27
00:01:10,500 --> 00:01:13,000
As the day progresses, I realize something profound:

28
00:01:13,500 --> 00:01:16,000
I'm not missing out on anything important.

29
00:01:16,500 --> 00:01:19,000
In fact, I'm gaining something invaluable:

30
00:01:19,500 --> 00:01:22,000
presence, focus, and peace of mind.

31
00:01:22,500 --> 00:01:25,000
This experiment has shown me that happiness

32
00:01:25,000 --> 00:01:27,500
doesn't come from having more things.

33
00:01:28,000 --> 00:01:30,500
It comes from appreciating what you already have

34
00:01:30,500 --> 00:01:33,000
and being fully present in the moment.`
      }
    }
  }

  /**
   * 获取演示视频数据
   * @param {string} url - YouTube URL
   * @returns {Object|null} 预缓存的视频数据或null
   */
  getDemoVideoData(url) {
    const videoId = this.extractVideoId(url)
    
    if (this.demoVideos[videoId]) {
      console.log(`🎬 使用预缓存演示数据: ${this.demoVideos[videoId].title}`)
      return {
        success: true,
        data: {
          ...this.demoVideos[videoId],
          hasAutoData: true,
          dataSource: 'demo-cache'
        }
      }
    }
    
    return null
  }

  /**
   * 从YouTube URL提取视频ID
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  /**
   * 获取所有可用的演示视频列表
   */
  getAvailableDemoVideos() {
    return Object.values(this.demoVideos).map(video => ({
      url: video.url,
      title: video.title,
      channelName: video.channelName,
      category: video.category,
      viewCount: video.viewCount,
      duration: video.duration
    }))
  }

  /**
   * 检查是否为演示视频
   */
  isDemoVideo(url) {
    const videoId = this.extractVideoId(url)
    return !!this.demoVideos[videoId]
  }

  /**
   * 获取演示视频的完整分析数据包
   */
  getDemoAnalysisPackage(url) {
    const demoData = this.getDemoVideoData(url)
    if (!demoData) return null

    const video = demoData.data
    
    return {
      type: 'url',
      data: url,
      videoData: video,
      autoFetched: true,
      hasValidSubtitles: true,
      dataQuality: 'demo-premium',
      isDemoData: true
    }
  }
}

export default new DemoDataService()