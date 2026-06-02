import 'package:flutter/material.dart';
import '../core/theme.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary, width: 2),
                image: const DecorationImage(
                  image: AssetImage('assets/images/logo.jpeg'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'Ranganadibeta',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w800,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pushNamed(context, '/signup'),
            child: const Text('SIGN UP', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
            child: ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/login'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: const Text('LOGIN', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeroSection(context),
            _buildMarqueeSection(),
            _buildInfoSection(
              title: 'Connecting with the Grassroots',
              items: [
                "Dedicated to building direct and transparent communication channels with every citizen.",
                "Actively listening to the voices of the local people to understand their real daily challenges.",
                "Organizing regular community programs and town halls to stay grounded and connected.",
                "Ensuring that no citizen's concern goes unheard or unaddressed by the administration.",
                "Believing that true governance begins by standing side-by-side with the community."
              ],
              imagePath: 'assets/images/WhatsApp Image 2026-05-31 at 4.40.31 PM (1).jpeg',
              reversed: false,
            ),
            _buildInfoSection(
              title: 'Amplifying Local Voices',
              items: [
                "Using the Ranganadibeta platform to capture localized feedback directly from the public.",
                "Empowering citizens to voice their opinions on ongoing schemes and local development.",
                "Creating a two-way street where administrative decisions are shaped by public sentiment.",
                "Championing the rights of marginalized communities by bringing their issues to the forefront."
              ],
              imagePath: 'assets/images/WhatsApp Image 2026-05-31 at 4.40.31 PM (2).jpeg',
              reversed: true,
            ),
            _buildInfoSection(
              title: 'Impact Through Listening',
              items: [
                "Resolved thousands of local grievances by prioritizing direct citizen feedback.",
                "Tailored government schemes to match the specific, on-the-ground needs of different areas.",
                "Ensured that the benefits of public welfare programs reach the most deserving citizens."
              ],
              imagePath: 'assets/images/WhatsApp Image 2026-05-31 at 4.40.32 PM.jpeg',
              reversed: false,
            ),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFC2410C), Color(0xFFFB923C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Colors.white.withOpacity(0.4)),
            ),
            child: const Text(
              'OFFICIAL DIGITAL PLATFORM',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Connecting with\nthe people &\namplifying\nyour voice',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Join thousands of citizens taking part in local governance, sharing feedback, and shaping the future of our constituency directly with the leadership.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: () => Navigator.pushNamed(context, '/signup'),
            icon: const Icon(Icons.arrow_forward),
            label: const Text('JOIN THE MOVEMENT', style: TextStyle(fontWeight: FontWeight.w800)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF111827),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            ),
          ),
          const SizedBox(height: 40),
          Image.asset(
            'assets/images/KK3_3210.jpg',
            height: 300,
            fit: BoxFit.contain,
          ),
        ],
      ),
    );
  }

  Widget _buildMarqueeSection() {
    final images = [
      'assets/images/0L0A7232.jpg',
      'assets/images/0L0A7318.JPG',
      'assets/images/0L0A7398.jpg',
      'assets/images/DSC_4562.jpg',
      'assets/images/IMG-20260409-WA0117.jpg',
      'assets/images/IMG_20260506_192807_420.webp',
      'assets/images/JSV_3298.jpg',
      'assets/images/JSV_3654.jpg',
      'assets/images/Picsart_26-05-27_21-42-43-492.jpg',
    ];

    return Container(
      color: AppColors.primaryLight.withOpacity(0.3),
      padding: const EdgeInsets.symmetric(vertical: 30),
      child: Column(
        children: [
          const Text(
            'MOMENTS ON THE GROUND',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryDark,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: images.length * 2, // Duplicate for endless effect feel
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      images[index % images.length],
                      height: 200,
                      width: 280,
                      fit: BoxFit.cover,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection({required String title, required List<String> items, required String imagePath, required bool reversed}) {
    List<Widget> content = [
      Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Image.asset(imagePath, fit: BoxFit.cover),
        ),
      ),
      const SizedBox(height: 24),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  item,
                  style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.5),
                ),
              ),
            ],
          ),
        )).toList(),
      )
    ];

    if (reversed) {
      content = content.reversed.toList();
    }

    return Container(
      color: reversed ? const Color(0xFFFAFAFA) : Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: Column(
        children: [
          const Text(
            'About',
            style: TextStyle(color: AppColors.primary, fontStyle: FontStyle.italic, fontSize: 16),
          ),
          const SizedBox(height: 8),
          Text(
            title.toUpperCase(),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 1),
          ),
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 30),
            width: 60,
            height: 3,
            color: AppColors.primary,
          ),
          ...content,
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      color: const Color(0xFFFFF7ED),
      padding: const EdgeInsets.all(40),
      child: const Center(
        child: Text(
          '© 2026 Ranganadibeta. All rights reserved.',
          style: TextStyle(color: Colors.black54, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
