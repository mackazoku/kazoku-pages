/**
 * Network Grid Background Animation
 * Creates a network of "Family Nodes" connected by lines.
 * Each Family Node contains "Member Nodes".
 * Nodes enlarge when the mouse hovers nearby.
 */

class MemberNode {
    constructor(parentRadius) {
        // Random position within the family node
        const angle = Math.random() * Math.PI * 2;
        // Distance from center, keeping it inside the parent
        const distance = Math.random() * (parentRadius * 0.6);

        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.radius = 2 + Math.random() * 3; // Small member nodes
        this.color = 'rgba(255, 255, 255, 0.8)';
    }

    draw(ctx, parentX, parentY, scale) {
        const x = parentX + this.x * scale;
        const y = parentY + this.y * scale;
        const r = this.radius * scale;

        ctx.fillStyle = this.color;

        // If scaled up significantly, draw abstract human figure
        if (scale > 1.5) {
            // Head
            ctx.beginPath();
            ctx.arc(x, y - r, r * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Body (rounded rectangle/arc)
            ctx.beginPath();
            ctx.arc(x, y + r * 0.8, r * 1.2, Math.PI, 0); // Semi-circle for shoulders
            ctx.fill();
        } else {
            // Default circle
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class FamilyNode {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;

        this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
        this.vy = (Math.random() - 0.5) * 0.5;

        this.baseRadius = 15 + Math.random() * 10;
        this.currentRadius = this.baseRadius;
        this.targetScale = 1;
        this.currentScale = 1;

        this.color = `rgba(255, 255, 255, 0.15)`;
        this.borderColor = `rgba(255, 255, 255, 0.3)`;

        // Create family members
        this.members = [];
        const memberCount = 2 + Math.floor(Math.random() * 4); // 2 to 5 members
        for (let i = 0; i < memberCount; i++) {
            this.members.push(new MemberNode(this.baseRadius));
        }
    }

    update(mouse) {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;

        // Interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Hover effect range
        if (distance < 200) { // Increased hit area (was 150)
            this.targetScale = 2.5; // Enlarge significantly
        } else {
            this.targetScale = 1;
        }

        // Smooth scaling
        this.currentScale += (this.targetScale - this.currentScale) * 0.1;
        this.currentRadius = this.baseRadius * this.currentScale;
    }

    draw(ctx, logoImage) {
        // Draw main family circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Logo if enlarged
        if (this.currentScale > 1.5 && logoImage && logoImage.complete) {
            const size = this.currentRadius * 0.8; // Smaller size
            ctx.save();
            ctx.globalAlpha = 0.7; // Make it slightly transparent
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius * 0.9, 0, Math.PI * 2);
            ctx.clip(); // Clip to circle
            ctx.drawImage(logoImage, this.x - size / 2, this.y - size / 2, size, size);
            ctx.restore();
        }

        // Draw members
        this.members.forEach(member => {
            member.draw(ctx, this.x, this.y, this.currentScale);
        });
    }
}

class NetworkBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.mouse = { x: -1000, y: -1000 };
        this.connectionDistance = 190; // Increased connection range

        // Load Logo Image
        this.logoImage = new Image();
        this.logoImage.src = 'images/logo.png';

        this.resize();
        this.initNodes();
        this.addEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Re-init nodes if dimensions change significantly to avoid clumping? 
        // For now, just let them be.
    }

    initNodes() {
        const area = this.canvas.width * this.canvas.height;
        const nodeCount = Math.floor(area / 12000); // Reduced density (was 9000)

        this.nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push(new FamilyNode(this.canvas.width, this.canvas.height));
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.resize());

        // Track mouse relative to canvas
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        // Touch support for mobile
        const handleTouch = (e) => {
            e.preventDefault(); // Prevent scrolling while touching canvas
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        };

        this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouch, { passive: false });
        this.canvas.addEventListener('touchend', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    drawConnections() {
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];

                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();

        this.nodes.forEach(node => {
            node.update(this.mouse);
            node.draw(this.ctx, this.logoImage);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('networkCanvas');
    if (canvas) {
        new NetworkBackground('networkCanvas');
    }
});
